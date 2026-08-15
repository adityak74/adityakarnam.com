#!/usr/bin/env python3
"""
bench_common.py — shared plumbing for the Apple Silicon MLX benchmark suite.

PURPOSE
    Every experiment script in this directory imports this module. It provides:
      * automatic machine/software metadata capture (chip, RAM, macOS, library versions,
        power state, thermal pressure) so results are self-describing
      * incremental, crash-safe result writing (JSONL appended after every single
        measurement, CSV + summary JSON rebuilt from the JSONL)
      * robust statistics helpers (median / IQR / MAD / CV) chosen deliberately because
        MLX is not run-to-run deterministic — see docs/phase2-benchmark-spec.md
      * MLX memory + timing helpers that probe for API location across mlx versions
      * a small progress printer so multi-hour runs are monitorable

USAGE
    Not run directly. Imported by exp1..exp4. To sanity check it:
        python3 scripts/benchmarks/bench_common.py

    That prints the captured machine metadata as JSON and exits — a useful
    pre-flight check that does not require MLX to be installed.

DESIGN NOTE ON STATISTICS
    Report the MEDIAN, never the mean. Apple Silicon benchmark distributions are
    right-skewed: an OS background task or a thermal excursion adds time, nothing
    ever subtracts it. The mean chases those outliers, the median does not.
    Dispersion is reported as IQR (p75 - p25) and as robust CV (IQR / median).
    A robust CV above 0.10 for a cell means that cell is untrustworthy and should
    be re-run with more repetitions before it goes in a chart.
"""

from __future__ import annotations

import csv
import json
import os
import platform
import shutil
import subprocess
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Iterable, Sequence

# --------------------------------------------------------------------------------------
# Paths
# --------------------------------------------------------------------------------------

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_RESULTS_DIR = REPO_ROOT / "scripts" / "benchmarks" / "results"


# --------------------------------------------------------------------------------------
# Shell helpers
# --------------------------------------------------------------------------------------


def _sh(cmd: Sequence[str], timeout: float = 10.0) -> str:
    """Run a command, return stripped stdout, empty string on any failure."""
    try:
        out = subprocess.run(
            list(cmd), capture_output=True, text=True, timeout=timeout, check=False
        )
        return (out.stdout or "").strip()
    except Exception:
        return ""


def _sysctl(key: str) -> str:
    return _sh(["sysctl", "-n", key])


def _pkg_version(name: str) -> str | None:
    try:
        import importlib.metadata as md

        return md.version(name)
    except Exception:
        return None


# --------------------------------------------------------------------------------------
# Machine metadata
# --------------------------------------------------------------------------------------


def power_state() -> dict[str, Any]:
    """Capture power/thermal state. These MATERIALLY change Apple Silicon results."""
    batt = _sh(["pmset", "-g", "batt"])
    therm = _sh(["pmset", "-g", "therm"])
    live = _sh(["pmset", "-g", "live"])

    on_ac = "AC Power" in batt
    # macOS <= 14 exposes `lowpowermode 0|1`; macOS 15+ exposes
    # `powermode 0|1|2` (0 = automatic, 1 = Low Power, 2 = High Power).
    low_power = None
    power_mode = None
    for line in live.splitlines():
        parts = line.strip().split()
        if len(parts) >= 2 and parts[0] == "lowpowermode":
            low_power = parts[1] == "1"
        if len(parts) >= 2 and parts[0] == "powermode":
            try:
                power_mode = int(parts[1])
                low_power = power_mode == 1
            except ValueError:
                pass

    cpu_speed_limit = None
    for line in therm.splitlines():
        if "CPU_Speed_Limit" in line:
            try:
                cpu_speed_limit = int(line.strip().split("=")[-1].strip())
            except Exception:
                pass

    return {
        "on_ac_power": on_ac,
        "low_power_mode": low_power,
        "power_mode": power_mode,  # 0 automatic, 1 Low Power, 2 High Power (macOS 15+)
        "cpu_speed_limit_pct": cpu_speed_limit,  # 100 == not thermally throttled
        "raw_batt": batt,
        "raw_therm": therm,
    }


def collect_metadata(extra: dict[str, Any] | None = None) -> dict[str, Any]:
    """Everything needed to reproduce or contextualise a result set."""
    mem_bytes = _sysctl("hw.memsize")
    meta: dict[str, Any] = {
        "captured_at_utc": datetime.now(timezone.utc).isoformat(),
        "hostname": platform.node(),
        "chip": _sysctl("machdep.cpu.brand_string") or platform.processor(),
        "arch": platform.machine(),
        "physical_cores": _sysctl("hw.physicalcpu"),
        "logical_cores": _sysctl("hw.logicalcpu"),
        "perf_cores": _sysctl("hw.perflevel0.physicalcpu"),
        "efficiency_cores": _sysctl("hw.perflevel1.physicalcpu"),
        "ram_bytes": int(mem_bytes) if mem_bytes.isdigit() else None,
        "ram_gb": round(int(mem_bytes) / 1024**3, 1) if mem_bytes.isdigit() else None,
        "macos_version": platform.mac_ver()[0],
        "macos_build": _sh(["sw_vers", "-buildVersion"]),
        "kernel": platform.release(),
        "python_version": sys.version.split()[0],
        "python_executable": sys.executable,
        "packages": {
            name: _pkg_version(name)
            for name in ("mlx", "mlx-lm", "numpy", "transformers", "sentencepiece")
        },
        "ollama_version": _sh(["ollama", "--version"]) if shutil.which("ollama") else None,
        "power": power_state(),
        "env": {
            k: v
            for k, v in os.environ.items()
            if k.startswith(("MLX", "METAL", "OLLAMA", "PYTORCH_"))
        },
    }
    if extra:
        meta.update(extra)
    return meta


# --------------------------------------------------------------------------------------
# Robust statistics
# --------------------------------------------------------------------------------------


def _percentile(sorted_vals: list[float], q: float) -> float:
    if not sorted_vals:
        return float("nan")
    if len(sorted_vals) == 1:
        return sorted_vals[0]
    pos = q * (len(sorted_vals) - 1)
    lo = int(pos)
    hi = min(lo + 1, len(sorted_vals) - 1)
    frac = pos - lo
    return sorted_vals[lo] * (1 - frac) + sorted_vals[hi] * frac


def robust_stats(values: Iterable[float], prefix: str = "") -> dict[str, float]:
    """
    Median-centred summary. See module docstring for why the median, not the mean.

    Returns keys: n, median, mean, p25, p75, iqr, mad, min, max, cv_robust.
    `cv_robust` = IQR / median. Treat > 0.10 as "this cell is noisy, re-run it".
    """
    vals = sorted(float(v) for v in values if v is not None and v == v)
    n = len(vals)
    if n == 0:
        return {f"{prefix}n": 0}
    median = _percentile(vals, 0.5)
    p25, p75 = _percentile(vals, 0.25), _percentile(vals, 0.75)
    mean = sum(vals) / n
    mad = _percentile(sorted(abs(v - median) for v in vals), 0.5)
    out = {
        f"{prefix}n": n,
        f"{prefix}median": median,
        f"{prefix}mean": mean,
        f"{prefix}p25": p25,
        f"{prefix}p75": p75,
        f"{prefix}iqr": p75 - p25,
        f"{prefix}mad": mad,
        f"{prefix}min": vals[0],
        f"{prefix}max": vals[-1],
        f"{prefix}cv_robust": (p75 - p25) / median if median else float("nan"),
    }
    return out


def linfit(xs: Sequence[float], ys: Sequence[float]) -> dict[str, float]:
    """Ordinary least squares y = a + b*x, plus R^2. Used for the KV-slope analysis."""
    n = len(xs)
    if n < 2:
        return {"slope": float("nan"), "intercept": float("nan"), "r2": float("nan"), "n": n}
    mx_ = sum(xs) / n
    my = sum(ys) / n
    sxx = sum((x - mx_) ** 2 for x in xs)
    sxy = sum((x - mx_) * (y - my) for x, y in zip(xs, ys))
    if sxx == 0:
        return {"slope": float("nan"), "intercept": float("nan"), "r2": float("nan"), "n": n}
    slope = sxy / sxx
    intercept = my - slope * mx_
    ss_tot = sum((y - my) ** 2 for y in ys)
    ss_res = sum((y - (intercept + slope * x)) ** 2 for x, y in zip(xs, ys))
    r2 = 1 - ss_res / ss_tot if ss_tot else float("nan")
    return {"slope": slope, "intercept": intercept, "r2": r2, "n": n}


# --------------------------------------------------------------------------------------
# Incremental, crash-safe result writing
# --------------------------------------------------------------------------------------


class ResultWriter:
    """
    Crash-safe result sink.

    Every completed measurement is appended to `<name>.jsonl` and flushed+fsynced
    immediately. An OOM or a kernel panic at context length 128k therefore cannot
    destroy the 30 rows already collected at shorter lengths.

    `finalize()` rebuilds `<name>.csv` and `<name>.json` (metadata + all rows +
    optional analysis block) from whatever landed in the JSONL. It is also safe to
    call `finalize_from_jsonl()` later on a partial file from a crashed run.
    """

    def __init__(self, results_dir: Path, name: str, metadata: dict[str, Any]):
        self.dir = Path(results_dir)
        self.dir.mkdir(parents=True, exist_ok=True)
        # Dry-run output is SYNTHETIC. It must never share a file with real
        # measurements: the JSONL is opened in append mode, so mixed rows would
        # be indistinguishable, and meta.json is overwritten by the latest run —
        # so a real run following a dry run would erase the only evidence that
        # some rows were fabricated. Segregate by filename, and stamp every row.
        self.dry_run = bool(metadata.get("args", {}).get("dry_run", False))
        if self.dry_run:
            name = f"{name}__DRYRUN"
        self.name = name
        self.metadata = metadata
        self.jsonl_path = self.dir / f"{name}.jsonl"
        self.csv_path = self.dir / f"{name}.csv"
        self.json_path = self.dir / f"{name}.json"
        self.meta_path = self.dir / f"{name}.meta.json"
        self.rows: list[dict[str, Any]] = []
        self._fh = self.jsonl_path.open("a", encoding="utf-8")
        self.meta_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    def append(self, row: dict[str, Any]) -> None:
        row = {"ts": datetime.now(timezone.utc).isoformat(), "dry_run": self.dry_run, **row}
        self.rows.append(row)
        self._fh.write(json.dumps(row, default=str) + "\n")
        self._fh.flush()
        os.fsync(self._fh.fileno())

    def note_failure(self, **kwargs: Any) -> None:
        """Record a failed cell (OOM, timeout, unsupported arm) without aborting the sweep."""
        self.append({"status": "failed", **kwargs})

    def _all_rows(self) -> list[dict[str, Any]]:
        rows: list[dict[str, Any]] = []
        if self.jsonl_path.exists():
            for line in self.jsonl_path.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if not line:
                    continue
                try:
                    rows.append(json.loads(line))
                except json.JSONDecodeError:
                    continue  # torn last line from a hard crash
        return rows

    def finalize(self, analysis: dict[str, Any] | None = None) -> dict[str, Any]:
        rows = self._all_rows()
        fields: list[str] = []
        for r in rows:
            for k in r:
                if k not in fields:
                    fields.append(k)
        with self.csv_path.open("w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
            w.writeheader()
            for r in rows:
                w.writerow({k: r.get(k, "") for k in fields})
        payload = {
            "experiment": self.name,
            "metadata": self.metadata,
            "analysis": analysis or {},
            "rows": rows,
        }
        self.json_path.write_text(json.dumps(payload, indent=2, default=str), encoding="utf-8")
        return payload

    def close(self) -> None:
        try:
            self._fh.close()
        except Exception:
            pass


# --------------------------------------------------------------------------------------
# Progress
# --------------------------------------------------------------------------------------


class Progress:
    """Single-line-per-event progress with ETA. Safe to pipe into a log file."""

    def __init__(self, total: int, label: str = "run"):
        self.total = max(total, 1)
        self.done = 0
        self.label = label
        self.t0 = time.time()

    def step(self, msg: str = "") -> None:
        self.done += 1
        elapsed = time.time() - self.t0
        rate = elapsed / self.done
        eta = rate * (self.total - self.done)
        print(
            f"[{self.label}] {self.done}/{self.total} "
            f"| elapsed {fmt_dur(elapsed)} | eta {fmt_dur(eta)} | {msg}",
            flush=True,
        )

    def done_msg(self) -> None:
        print(
            f"[{self.label}] complete: {self.done}/{self.total} cells in "
            f"{fmt_dur(time.time() - self.t0)}",
            flush=True,
        )


def fmt_dur(seconds: float) -> str:
    seconds = max(0.0, float(seconds))
    h, rem = divmod(int(seconds), 3600)
    m, s = divmod(rem, 60)
    if h:
        return f"{h}h{m:02d}m"
    if m:
        return f"{m}m{s:02d}s"
    return f"{s}s"


def banner(title: str, meta: dict[str, Any]) -> None:
    print("=" * 78, flush=True)
    print(f"  {title}", flush=True)
    print("=" * 78, flush=True)
    p = meta.get("power", {})
    print(f"  chip        : {meta.get('chip')}  ({meta.get('ram_gb')} GB unified)", flush=True)
    print(f"  macOS       : {meta.get('macos_version')} ({meta.get('macos_build')})", flush=True)
    print(f"  mlx / mlx-lm: {meta['packages'].get('mlx')} / {meta['packages'].get('mlx-lm')}", flush=True)
    print(
        f"  power       : on_ac={p.get('on_ac_power')} low_power={p.get('low_power_mode')} "
        f"cpu_speed_limit={p.get('cpu_speed_limit_pct')}%",
        flush=True,
    )
    if p.get("on_ac_power") is False:
        print("  !! WARNING: running on battery. Plug in before a real run.", flush=True)
    if p.get("low_power_mode"):
        print("  !! WARNING: Low Power Mode is ON. Turn it off before a real run.", flush=True)
    if (p.get("cpu_speed_limit_pct") or 100) < 100:
        print("  !! WARNING: machine is already thermally limited. Let it cool.", flush=True)
    print("=" * 78, flush=True)


# --------------------------------------------------------------------------------------
# MLX helpers (imported lazily so --dry-run works without MLX installed)
# --------------------------------------------------------------------------------------


def require_mlx():
    try:
        import mlx.core as mx  # noqa: F401
    except ImportError:
        sys.exit(
            "MLX is not installed in this interpreter.\n"
            "  Fastest path:  uv run --with mlx --with mlx-lm python <this script>\n"
            "  Or:            python3 -m pip install mlx mlx-lm\n"
            "Use --dry-run to exercise the harness without MLX."
        )
    import mlx.core as mx

    return mx


class MemProbe:
    """
    Version-tolerant wrapper over MLX memory introspection.

    mlx moved these between `mlx.core.metal.*` and `mlx.core.*` across releases,
    so probe both and degrade to None rather than crashing a 2-hour run.
    """

    def __init__(self, mx):
        self.mx = mx
        self._get_peak = self._resolve("get_peak_memory")
        self._get_active = self._resolve("get_active_memory")
        self._get_cache = self._resolve("get_cache_memory")
        self._reset_peak = self._resolve("reset_peak_memory")
        self._clear_cache = self._resolve("clear_cache")

    def _resolve(self, fname: str) -> Callable | None:
        for holder in (self.mx, getattr(self.mx, "metal", None)):
            if holder is not None and hasattr(holder, fname):
                return getattr(holder, fname)
        return None

    def _call(self, fn) -> int | None:
        try:
            return int(fn()) if fn else None
        except Exception:
            return None

    def peak(self) -> int | None:
        return self._call(self._get_peak)

    def active(self) -> int | None:
        return self._call(self._get_active)

    def cache(self) -> int | None:
        return self._call(self._get_cache)

    def reset_peak(self) -> None:
        try:
            if self._reset_peak:
                self._reset_peak()
        except Exception:
            pass

    def clear_cache(self) -> None:
        try:
            if self._clear_cache:
                self._clear_cache()
        except Exception:
            pass


def host_memory_pressure() -> dict[str, Any]:
    """
    Swap + compressed-memory readings. This is how we distinguish
    'unified memory bandwidth saturation' from 'the OS started paging'.
    """
    out: dict[str, Any] = {}
    swap = _sysctl("vm.swapusage")
    out["vm_swapusage"] = swap
    try:
        # "total = 4096.00M  used = 512.00M  free = 3584.00M"
        parts = dict(
            (seg.split("=")[0].strip(), seg.split("=")[1].strip())
            for seg in swap.split("  ")
            if "=" in seg
        )
        used = parts.get("used", "0M")
        out["swap_used_mb"] = float(used.rstrip("M"))
    except Exception:
        out["swap_used_mb"] = None
    vm = _sh(["vm_stat"])
    for line in vm.splitlines():
        if "Pages occupied by compressor" in line:
            try:
                pages = int(line.split(":")[1].strip().rstrip("."))
                out["compressed_mb"] = round(pages * 16384 / 1024**2, 1)
            except Exception:
                pass
    return out


# --------------------------------------------------------------------------------------
# Shared CLI arguments
# --------------------------------------------------------------------------------------


def add_common_args(parser) -> None:
    parser.add_argument(
        "--results-dir",
        default=str(DEFAULT_RESULTS_DIR),
        help="Directory for JSONL/CSV/JSON output (default: scripts/benchmarks/results)",
    )
    parser.add_argument(
        "--tag",
        default="",
        help="Suffix appended to output filenames, e.g. --tag m5pro-run2",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Exercise the full harness with synthetic numbers and NO model load. "
        "Finishes in seconds. Use this to verify plumbing before a long run.",
    )
    parser.add_argument(
        "--smoke",
        action="store_true",
        help="Real measurements but a minimal sweep (~1-3 min). Verifies the model "
        "path end to end before committing to the full run.",
    )
    parser.add_argument(
        "--seed", type=int, default=0, help="RNG seed where sampling is involved (default: 0)"
    )


def out_name(base: str, tag: str) -> str:
    return f"{base}__{tag}" if tag else base


@dataclass
class Timer:
    """Monotonic timer with explicit MLX eval barriers handled by the caller."""

    t0: float = field(default_factory=time.perf_counter)

    def reset(self) -> None:
        self.t0 = time.perf_counter()

    def lap(self) -> float:
        return time.perf_counter() - self.t0


if __name__ == "__main__":
    print(json.dumps(collect_metadata(), indent=2))
