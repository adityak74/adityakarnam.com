#!/usr/bin/env python3
"""Deterministic normalization and publication pipeline for Coding Agent Value Lab."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
from collections import defaultdict
from copy import deepcopy
from datetime import date
from pathlib import Path
from typing import Any

EVIDENCE = {
    "official_verified",
    "independently_reproduced",
    "first_party_measured",
    "vendor_reported",
    "community_observed",
    "estimated",
    "experimental",
}


def slug(value: str) -> str:
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", value.lower())).strip("-")


def configuration_id(record: dict[str, Any]) -> str:
    return (
        f"{slug(record['provider'])}-{slug(record['model'])}__{slug(record['harness'])}__"
        f"{slug(record['reasoningEffort'])}__{slug(record['benchmark'])}-{slug(record['benchmarkVersion'])}"
    )


def calculate_api_cost(
    input_tokens: int,
    cached_input_tokens: int,
    output_tokens: int,
    input_price: float,
    cached_input_price: float,
    output_price: float,
) -> float:
    uncached = max(0, input_tokens - cached_input_tokens)
    return (uncached * input_price + cached_input_tokens * cached_input_price + output_tokens * output_price) / 1_000_000


def wilson_interval(score: float, task_count: int, z: float = 1.96) -> tuple[float, float]:
    if task_count <= 0:
        return score, score
    denominator = 1 + z * z / task_count
    center = (score + z * z / (2 * task_count)) / denominator
    half = z * math.sqrt(score * (1 - score) / task_count + z * z / (4 * task_count * task_count)) / denominator
    return max(0.0, center - half), min(1.0, center + half)


def validate_bundle(bundle: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    required = ("run", "sources", "benchmarkRuns", "prices", "plans", "quotaObservations", "integrityNotices")
    for field in required:
        if field not in bundle:
            errors.append(f"missing top-level field: {field}")

    source_ids: set[str] = set()
    for index, source in enumerate(bundle.get("sources", [])):
        source_id = source.get("id")
        if not source_id:
            errors.append(f"sources[{index}] missing id")
        elif source_id in source_ids:
            errors.append(f"duplicate source id: {source_id}")
        source_ids.add(source_id)
        if not source.get("url", "").startswith("https://"):
            errors.append(f"sources[{index}] requires an https URL")

    seen_runs: set[tuple[Any, ...]] = set()
    for index, run in enumerate(bundle.get("benchmarkRuns", [])):
        prefix = f"benchmarkRuns[{index}]"
        for field in ("provider", "model", "harness", "reasoningEffort", "benchmark", "benchmarkVersion", "score", "sourceId", "evidence"):
            if field not in run:
                errors.append(f"{prefix} missing {field}")
        score = run.get("score")
        if not isinstance(score, (int, float)) or isinstance(score, bool) or not 0 <= score <= 1:
            errors.append(f"{prefix} score must be between 0 and 1")
        if run.get("sourceId") not in source_ids:
            errors.append(f"{prefix} references unknown source {run.get('sourceId')}")
        if run.get("evidence") not in EVIDENCE:
            errors.append(f"{prefix} has unknown evidence label {run.get('evidence')}")
        uncertainty = run.get("reportedUncertainty")
        if uncertainty is not None and (not isinstance(uncertainty, (int, float)) or isinstance(uncertainty, bool) or not 0 <= uncertainty <= 1):
            errors.append(f"{prefix} reportedUncertainty must be between 0 and 1")
        token_values = {field: run.get(field) for field in ("inputTokens", "cachedInputTokens", "outputTokens") if field in run}
        for field, value in token_values.items():
            if not isinstance(value, int) or isinstance(value, bool) or value < 0:
                errors.append(f"{prefix} {field} must be a non-negative integer")
        if run.get("cachedInputTokens", 0) > run.get("inputTokens", 0):
            errors.append(f"{prefix} cachedInputTokens cannot exceed inputTokens")
        key = tuple(run.get(field) for field in ("provider", "model", "harness", "reasoningEffort", "benchmark", "benchmarkVersion", "evaluatedAt"))
        if key in seen_runs:
            errors.append(f"duplicate benchmark run: {key}")
        seen_runs.add(key)

    for index, price in enumerate(bundle.get("prices", [])):
        prefix = f"prices[{index}]"
        for field in ("provider", "model", "effectiveFrom", "sourceId"):
            if not price.get(field):
                errors.append(f"{prefix} missing {field}")
        if price.get("sourceId") not in source_ids:
            errors.append(f"{prefix} references unknown source {price.get('sourceId')}")
        for field in ("inputPerMillionUsd", "cachedInputPerMillionUsd", "outputPerMillionUsd"):
            value = price.get(field)
            if not isinstance(value, (int, float)) or isinstance(value, bool) or value < 0:
                errors.append(f"{prefix} {field} must be non-negative")
    return errors


def _price_lookup(prices: list[dict[str, Any]]) -> dict[tuple[str, str], list[dict[str, Any]]]:
    result: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    for item in sorted(prices, key=lambda record: record["effectiveFrom"]):
        result[(item["provider"], item["model"])].append(item)
    return result


def _price_as_of(prices: list[dict[str, Any]], evaluated_at: str) -> dict[str, Any] | None:
    eligible = [price for price in prices if price["effectiveFrom"] <= evaluated_at]
    return eligible[-1] if eligible else None


def normalize_bundle(bundle: dict[str, Any]) -> dict[str, Any]:
    errors = validate_bundle(bundle)
    if errors:
        raise ValueError("Invalid research bundle:\n- " + "\n- ".join(errors))

    normalized = deepcopy(bundle)
    prices = _price_lookup(normalized["prices"])
    notices = {notice.get("configurationId") for notice in normalized["integrityNotices"] if notice.get("active")}
    source_access = {source["id"]: source.get("accessible") is True for source in normalized["sources"]}
    runs = []
    for raw in normalized["benchmarkRuns"]:
        run = deepcopy(raw)
        run["configurationId"] = configuration_id(run)
        run["runId"] = "sha256:" + hashlib.sha256(
            json.dumps(run, sort_keys=True, separators=(",", ":")).encode()
        ).hexdigest()
        if run.get("reportedUncertainty") is not None:
            low = max(0.0, float(run["score"]) - float(run["reportedUncertainty"]))
            high = min(1.0, float(run["score"]) + float(run["reportedUncertainty"]))
        else:
            low, high = wilson_interval(float(run["score"]), int(run.get("taskCount", 0)))
        run["confidenceIntervalLow"] = round(low, 6)
        run["confidenceIntervalHigh"] = round(high, 6)
        price = _price_as_of(prices.get((run["provider"], run["model"]), []), run.get("evaluatedAt", normalized["run"]["retrievedAt"][:10]))
        if price and all(field in run for field in ("inputTokens", "cachedInputTokens", "outputTokens")):
            cost = calculate_api_cost(
                int(run["inputTokens"]), int(run["cachedInputTokens"]), int(run["outputTokens"]),
                float(price["inputPerMillionUsd"]), float(price["cachedInputPerMillionUsd"]), float(price["outputPerMillionUsd"]),
            )
            run["costPerTaskUsd"] = round(cost, 6)
            run["expectedSolvedTasksPerDollar"] = round(float(run["score"]) / cost, 6) if cost else None
        run["integrityWarning"] = run["configurationId"] in notices
        run["sourceAccessible"] = source_access.get(run["sourceId"], False)
        runs.append(run)
    normalized["benchmarkRuns"] = sorted(runs, key=lambda item: (item["benchmark"], item["benchmarkVersion"], item["configurationId"]))
    return normalized


def compute_pareto_frontier(records: list[dict[str, Any]]) -> dict[str, list[str]]:
    groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in records:
        if record.get("costPerTaskUsd") is not None and not record.get("integrityWarning"):
            groups[f"{record['benchmark']}@{record['benchmarkVersion']}"] .append(record)

    frontiers: dict[str, list[str]] = {}
    for key, group in sorted(groups.items()):
        frontier = []
        for candidate in group:
            dominated = any(
                other["configurationId"] != candidate["configurationId"]
                and other["score"] >= candidate["score"]
                and other["costPerTaskUsd"] <= candidate["costPerTaskUsd"]
                and (other["score"] > candidate["score"] or other["costPerTaskUsd"] < candidate["costPerTaskUsd"])
                for other in group
            )
            if not dominated:
                frontier.append(candidate["configurationId"])
        frontiers[key] = sorted(frontier)
    return frontiers


def _select_recommendation(runs: list[dict[str, Any]]) -> dict[str, Any]:
    eligible = [run for run in runs if run.get("costPerTaskUsd") is not None and not run.get("integrityWarning") and run.get("sourceAccessible")]
    if not eligible:
        measured = [run for run in runs if not run.get("integrityWarning") and run.get("sourceAccessible")]
        return {
            "eyebrow": "Current evidence", "title": "Measured leaderboard live; value ranking pending.",
            "summary": "Verified benchmark results are published, but sourced per-run usage is still required for cost and value recommendations.", "configurationId": None,
            "metrics": [
                {"label": "Measured configurations", "value": str(len(measured))},
                {"label": "Cost-ready configurations", "value": "0"},
            ],
        }
    groups: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    for run in eligible:
        groups[(run["benchmark"], run["benchmarkVersion"])].append(run)
    selected = max(groups.values(), key=lambda group: (max(item.get("evaluatedAt", "") for item in group), len(group)))
    best_score = max(run["score"] for run in selected)
    practical = [run for run in selected if run["score"] >= best_score - 0.02]
    winner = max(practical, key=lambda run: (float("inf") if run["costPerTaskUsd"] == 0 else (run.get("expectedSolvedTasksPerDollar") or 0), run["score"]))
    return {
        "eyebrow": "Best measured value",
        "title": f"Use {winner['model']} with {winner['harness']} at {winner['reasoningEffort']} effort.",
        "summary": f"It is within two points of the highest score in {winner['benchmark']}@{winner['benchmarkVersion']} and offers the strongest expected solved tasks per API dollar in that practical-equivalence band.",
        "configurationId": winner["configurationId"],
        "metrics": [
            {"label": "Measured score", "value": f"{winner['score'] * 100:.1f}%"},
            {"label": "Median task cost", "value": f"${winner['costPerTaskUsd']:.2f}"},
            {"label": "Evidence", "value": winner["evidence"].replace("_", " ").title()},
        ],
    }


def _generate_insights(runs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    insights: list[dict[str, Any]] = []
    eligible = [run for run in runs if run.get("costPerTaskUsd") is not None and not run.get("integrityWarning") and run.get("sourceAccessible")]
    for subject in eligible:
        for comparison in eligible:
            if subject["configurationId"] == comparison["configurationId"]:
                continue
            if (subject["benchmark"], subject["benchmarkVersion"]) != (comparison["benchmark"], comparison["benchmarkVersion"]):
                continue
            score_delta = float(subject["score"]) - float(comparison["score"])
            if comparison["costPerTaskUsd"] == 0:
                continue
            saving = (float(comparison["costPerTaskUsd"]) - float(subject["costPerTaskUsd"])) / float(comparison["costPerTaskUsd"])
            if abs(score_delta) <= 0.02 and saving >= 0.25:
                facts = {
                    "scoreSubject": round(float(subject["score"]), 6),
                    "scoreComparison": round(float(comparison["score"]), 6),
                    "scoreDelta": round(score_delta, 6),
                    "costSubjectUsd": round(float(subject["costPerTaskUsd"]), 6),
                    "costComparisonUsd": round(float(comparison["costPerTaskUsd"]), 6),
                    "costSavingPct": round(saving * 100, 1),
                }
                insight_id = "sha256:" + hashlib.sha256(
                    json.dumps({"type": "near_equal_lower_cost", "subject": subject["runId"], "comparison": comparison["runId"], "facts": facts}, sort_keys=True).encode()
                ).hexdigest()
                insights.append({
                    "id": insight_id,
                    "type": "near_equal_lower_cost",
                    "label": "Near-equivalent value",
                    "title": f"{subject['model']} is the lower-cost practical alternative.",
                    "body": f"It is within {abs(facts['scoreDelta']) * 100:.1f} measured points of {comparison['model']} while costing about {facts['costSavingPct']:.1f}% less per evaluated task.",
                    "accent": "cyan",
                    "evidence": subject["evidence"],
                    "facts": facts,
                    "sourceRunIds": [subject["runId"], comparison["runId"]],
                })
    return sorted(insights, key=lambda item: item["id"])


def build_publication(normalized: dict[str, Any]) -> dict[str, Any]:
    runs = normalized["benchmarkRuns"]
    frontiers = compute_pareto_frontier(runs)
    recommendation = _select_recommendation(runs)
    configurations = [
        {
            "id": run["configurationId"], "model": run["model"], "provider": run["provider"],
            "harness": run["harness"], "reasoningEffort": run["reasoningEffort"],
            "benchmark": run["benchmark"], "benchmarkVersion": run["benchmarkVersion"],
            "score": run["score"], "costPerTaskUsd": run.get("costPerTaskUsd"),
            "confidenceIntervalLow": run["confidenceIntervalLow"], "confidenceIntervalHigh": run["confidenceIntervalHigh"],
            "evidence": run["evidence"], "sourceUrl": next(source["url"] for source in normalized["sources"] if source["id"] == run["sourceId"]),
        }
        for run in runs if not run.get("integrityWarning") and run.get("sourceAccessible")
    ]
    points = [
        {"configurationId": item["id"], "x": item["costPerTaskUsd"], "y": item["score"]}
        for item in configurations if item["costPerTaskUsd"] is not None
    ]
    score_points = [
        {
            "configurationId": item["id"],
            "label": f"{item['model']} · {item['harness']}",
            "value": item["score"],
            "low": item["confidenceIntervalLow"],
            "high": item["confidenceIntervalHigh"],
        }
        for item in sorted(configurations, key=lambda record: record["score"], reverse=True)
    ]
    charts = [{
        "id": "measured-performance", "title": "Measured performance", "type": "bar",
        "xLabel": "Configuration", "yLabel": "Benchmark pass rate", "points": score_points,
    }]
    if points:
        charts.append({
            "id": "performance-cost", "title": "Performance versus API cost", "type": "scatter",
            "xLabel": "Median task cost (USD)", "yLabel": "Benchmark pass rate", "points": points,
            "frontiers": frontiers,
        })
    updated = normalized["run"]["retrievedAt"][:10]
    return {
        "schemaVersion": 1, "updatedAt": updated, "title": "Coding Agent Value Lab",
        "subtitle": "Independent analysis of coding models, harnesses, reasoning levels, costs, and subscription efficiency.",
        "positioning": "Benchmarks tell you who scored highest. This lab tells you what to use.",
        "status": f"{len(configurations)} publishable configurations · refreshed {updated}",
        "recommendation": recommendation, "alternatives": [],
        "controls": {
            "workloads": [{"id": value, "label": value.title()} for value in ("small", "medium", "large", "xl")],
            "accessModes": [{"id": "both", "label": "Subscription + API"}, {"id": "subscription", "label": "Subscription"}, {"id": "api", "label": "API"}],
            "goals": [{"id": "value", "label": "Best value"}, {"id": "quality", "label": "Best quality"}, {"id": "throughput", "label": "Most work per window"}, {"id": "speed", "label": "Fastest"}],
        },
        "insights": _generate_insights(runs), "configurations": configurations,
        "charts": charts,
        "methodology": {
            "summary": "Benchmark versions are isolated; evidence, source dates, uncertainty, harness, and reasoning effort remain visible.",
            "assumptions": ["A two-point practical-equivalence band is used for the default value recommendation."],
            "sources": [{"label": source["id"], "url": source["url"], "retrievedAt": source["retrievedAt"]} for source in normalized["sources"]],
        },
        "history": [],
    }


def evaluate_change_gate(
    previous: dict[str, Any] | None,
    current: dict[str, Any],
    failed_records: int,
    total_records: int,
    inaccessible_sources: list[str],
    active_integrity_notices: list[str],
) -> dict[str, Any]:
    reasons: list[str] = []
    if inaccessible_sources:
        reasons.append("official source unavailable: " + ", ".join(sorted(inaccessible_sources)))
    if active_integrity_notices:
        reasons.append("active integrity notice requires review: " + ", ".join(sorted(active_integrity_notices)))
    if total_records and failed_records / total_records > 0.10:
        reasons.append("more than 10% of records failed validation")
    if previous:
        old = {item["id"]: item for item in previous.get("configurations", [])}
        for item in current.get("configurations", []):
            prior = old.get(item["id"])
            if not prior:
                continue
            if abs(float(item["score"]) - float(prior["score"])) > 0.05:
                reasons.append(f"score changed by more than five points: {item['id']}")
            old_cost, new_cost = prior.get("costPerTaskUsd"), item.get("costPerTaskUsd")
            if old_cost and new_cost is not None and abs(float(new_cost) - float(old_cost)) / float(old_cost) > 0.20:
                reasons.append(f"price changed by more than 20%: {item['id']}")
        if previous.get("recommendation", {}).get("configurationId") != current.get("recommendation", {}).get("configurationId"):
            reasons.append("top recommendation changed")
    return {"requiresReview": bool(reasons), "reasons": sorted(set(reasons))}


def write_publication(publication: dict[str, Any], current_path: Path, snapshot_path: Path) -> None:
    payload = json.dumps(publication, indent=2, sort_keys=True) + "\n"
    current_path.parent.mkdir(parents=True, exist_ok=True)
    snapshot_path.parent.mkdir(parents=True, exist_ok=True)
    if snapshot_path.exists() and snapshot_path.read_text() != payload:
        raise ValueError(f"snapshot is immutable and already differs: {snapshot_path}")
    current_path.write_text(payload)
    snapshot_path.write_text(payload)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("bundle", type=Path, help="Collected raw research bundle JSON")
    parser.add_argument("--current", type=Path, default=Path("src/data/value-lab/current.json"))
    parser.add_argument("--snapshot-root", type=Path, default=Path("src/data/value-lab/snapshots"))
    parser.add_argument("--previous", type=Path)
    parser.add_argument("--gate-output", type=Path)
    args = parser.parse_args()

    bundle = json.loads(args.bundle.read_text())
    inaccessible = [source.get("id", "unknown") for source in bundle["sources"] if not source.get("accessible")]
    active_notices = [notice.get("id") or notice.get("configurationId") or "unknown" for notice in bundle.get("integrityNotices", []) if notice.get("active")]
    validation_errors = validate_bundle(bundle)
    if validation_errors:
        gate = {
            "requiresReview": True,
            "reasons": ["research bundle failed validation"],
            "validationErrors": validation_errors,
        }
        if args.gate_output:
            args.gate_output.parent.mkdir(parents=True, exist_ok=True)
            args.gate_output.write_text(json.dumps(gate, indent=2, sort_keys=True) + "\n")
        print(json.dumps({"gate": gate}, sort_keys=True))
        return 2

    normalized = normalize_bundle(bundle)
    publication = build_publication(normalized)
    snapshot = args.snapshot_root / publication["updatedAt"] / f"{slug(bundle['run']['runId'])}.json"
    previous = json.loads(args.previous.read_text()) if args.previous and args.previous.exists() else None
    gate = evaluate_change_gate(previous, publication, 0, len(bundle["benchmarkRuns"]), inaccessible, active_notices)
    if args.gate_output:
        args.gate_output.parent.mkdir(parents=True, exist_ok=True)
        args.gate_output.write_text(json.dumps(gate, indent=2, sort_keys=True) + "\n")
    write_publication(publication, args.current, snapshot)
    print(json.dumps({"current": str(args.current), "snapshot": str(snapshot), "gate": gate}, sort_keys=True))
    return 2 if gate["requiresReview"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
