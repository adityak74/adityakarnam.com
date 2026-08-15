#!/usr/bin/env bash
# run_all.sh — drive the whole Phase 2 benchmark suite in the correct order.
#
# PURPOSE
#   Runs exp2 -> exp1 -> exp3 -> exp4. exp2 goes first on purpose: it is cheap and it
#   validates that the machine is in a clean thermal/power state before the expensive
#   runs start, AND it produces the bandwidth ceiling that exp1's causal claim is checked
#   against.
#
# USAGE
#   ./scripts/benchmarks/run_all.sh --dry-run          # verify everything in seconds
#   ./scripts/benchmarks/run_all.sh --smoke            # real, tiny, ~10 min total
#   ./scripts/benchmarks/run_all.sh                    # full run, see spec for runtime
#   ./scripts/benchmarks/run_all.sh --reduced          # reduced-scope full run (~2h)
#
# Environment overrides:
#   MLX_MODEL      default mlx-community/Qwen3-8B-4bit
#   OLLAMA_MODEL   default qwen3:8b
#   TAG            appended to every output filename, e.g. TAG=m5pro-run1
#   PY             python launcher, default "uv run --with mlx --with mlx-lm python3"
#
# Every run is teed to results/logs/<exp>-<timestamp>.log so a multi-hour run leaves a
# reviewable trail even if the terminal is lost.

set -o pipefail   # deliberately NOT set -e: a failed experiment must not abort the suite

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS="${RESULTS:-$HERE/results}"
LOGS="$RESULTS/logs"
mkdir -p "$LOGS"

MLX_MODEL="${MLX_MODEL:-mlx-community/Qwen3-8B-4bit}"
OLLAMA_MODEL="${OLLAMA_MODEL:-qwen3:8b}"
TAG="${TAG:-}"
PY="${PY:-uv run --with mlx --with mlx-lm python3}"

MODE=""
REDUCED=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) MODE="--dry-run"; PY="${PY_DRY:-python3}" ;;
    --smoke)   MODE="--smoke" ;;
    --reduced) REDUCED=1 ;;
    *) echo "unknown flag: $arg"; exit 2 ;;
  esac
done

# macOS ships bash 3.2, where empty-array expansion is awkward. These args never
# contain spaces, so plain word-splitting strings are the simplest correct thing.
TAG_ARG=""
[ -n "$TAG" ] && TAG_ARG="--tag $TAG"

if [ "$REDUCED" = "1" ]; then
  EXP1_ARGS="--contexts 512,2048,8192,32768,65536 --kv-bits none,4 --reps 5"
  EXP3_ARGS="--batches 1,2,4,8,16 --contexts 512,16384 --reps 3"
  EXP4_ARGS="--contexts 512,4096,16384,32768 --reps 3"
  SCOPE=" (reduced scope)"
else
  EXP1_ARGS=""
  EXP3_ARGS=""
  EXP4_ARGS=""
  SCOPE=""
fi

run() {
  local name="$1"; shift
  local log="$LOGS/${name}-$(date +%Y%m%d-%H%M%S).log"
  echo ""
  echo "############################################################"
  echo "# $name   ->  $log"
  echo "############################################################"
  # shellcheck disable=SC2086
  $PY $@ 2>&1 | tee "$log"
  local rc=${PIPESTATUS[0]}
  if [ "$rc" -ne 0 ]; then
    echo "!! $name exited with code $rc — partial results are still in $RESULTS"
  fi
  return 0   # never abort the suite; every script writes incrementally
}

echo "results dir : $RESULTS"
echo "mlx model   : $MLX_MODEL"
echo "ollama model: $OLLAMA_MODEL"
echo "mode        : ${MODE:-full}${SCOPE}"

run exp2 "$HERE/exp2_bandwidth_roofline.py" $MODE --results-dir "$RESULTS" $TAG_ARG

run exp1 "$HERE/exp1_kv_cache_longcontext.py" $MODE --results-dir "$RESULTS" \
  --model "$MLX_MODEL" $EXP1_ARGS $TAG_ARG

run exp3 "$HERE/exp3_batch_concurrency.py" $MODE --results-dir "$RESULTS" \
  --engines mlx --mlx-model "$MLX_MODEL" $EXP3_ARGS $TAG_ARG

run exp4 "$HERE/exp4_mlx_vs_ollama_longcontext.py" $MODE --results-dir "$RESULTS" \
  --mlx-model "$MLX_MODEL" --ollama-model "$OLLAMA_MODEL" $EXP4_ARGS $TAG_ARG

echo ""
echo "=== suite complete ==="
ls -la "$RESULTS"/*.json 2>/dev/null
echo "Hand back: the whole $RESULTS directory (json + csv + jsonl + meta + logs)."
