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
            run["priceSourceId"] = price["sourceId"]
            run["priceEffectiveFrom"] = price["effectiveFrom"]
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
    selected = _select_current_cohort(eligible)
    best_score = max(run["score"] for run in selected)
    practical = [run for run in selected if run["score"] >= best_score - 0.02]
    winner = max(practical, key=lambda run: (float("inf") if run["costPerTaskUsd"] == 0 else (run.get("expectedSolvedTasksPerDollar") or 0), run["score"]))
    return {
        "eyebrow": "Best measured value",
        "title": f"Use {winner['model']} with {winner['harness']} at {winner['reasoningEffort']} effort.",
        "summary": f"It is within two points of the highest score in {winner['benchmark']}@{winner['benchmarkVersion']} and offers the strongest expected solved tasks per API dollar in that practical-equivalence band.",
        "configurationId": winner["configurationId"],
        "sourceRunIds": [winner["runId"]],
        "priceSourceId": winner["priceSourceId"],
        "priceEffectiveFrom": winner["priceEffectiveFrom"],
        "metrics": [
            {"label": "Measured score", "value": f"{winner['score'] * 100:.1f}%"},
            {"label": "Median task cost", "value": f"${winner['costPerTaskUsd']:.2f}"},
            {"label": "Evidence", "value": winner["evidence"].replace("_", " ").title()},
        ],
    }


def _select_current_cohort(runs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    groups: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    for run in runs:
        groups[(run["benchmark"], run["benchmarkVersion"])].append(run)
    if not groups:
        return []
    return max(
        groups.items(),
        key=lambda item: (
            max(run.get("evaluatedAt", "") for run in item[1]),
            len(item[1]),
            item[0],
        ),
    )[1]


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


def _build_dashboard_cards(
    runs: list[dict[str, Any]], sources: list[dict[str, Any]], updated_at: str,
    recommendation: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    publishable = [run for run in runs if run.get("sourceAccessible") and not run.get("integrityWarning")]
    ranked = sorted(publishable, key=lambda run: (-float(run["score"]), run["configurationId"]))
    source_ids = {source["id"] for source in sources}
    evidence_ready = {
        "official_verified", "independently_reproduced", "first_party_measured"
    }

    def unavailable_card(card_id: str, label: str, accent: str = "slate") -> dict[str, Any]:
        return {
            "id": card_id, "label": label, "value": "Unavailable",
            "detail": "Not enough publishable benchmark evidence yet.", "accent": accent,
            "evidence": "estimated", "sourceRunIds": [], "group": "summary",
        }

    if not ranked:
        return [
            unavailable_card("leader", "Measured leader", "cyan"),
            unavailable_card("measured-configurations", "Measured configurations"),
            unavailable_card("leader-gap", "Leader gap"),
            unavailable_card("evidence-health", "Evidence health"),
            {**unavailable_card("top-three", "Top three"), "group": "supporting"},
            {**unavailable_card("largest-harness-difference", "Largest harness difference"), "group": "supporting"},
            {**unavailable_card("research-coverage", "Research coverage"), "group": "supporting"},
        ]

    leader = ranked[0]
    second = ranked[1] if len(ranked) > 1 else None
    verified = [run for run in publishable if run.get("evidence") in evidence_ready and run.get("sourceId") in source_ids]
    harness_chart = _build_harness_chart(_configuration_records(runs, sources))
    coverage_chart = _build_coverage_chart(_configuration_records(runs, sources), recommendation)
    harness_points = harness_chart["points"]
    coverage_points = coverage_chart["points"]
    largest = max(harness_points, key=lambda point: (point["delta"], point["id"])) if harness_points else None
    return [
        {
            "id": "leader", "label": "Measured leader", "value": f"{leader['score'] * 100:.1f}%",
            "detail": f"{leader['model']} · {leader['harness']} · interval {leader['confidenceIntervalLow'] * 100:.1f}–{leader['confidenceIntervalHigh'] * 100:.1f}%",
            "accent": "cyan", "evidence": leader["evidence"], "sourceRunIds": [leader["runId"]], "group": "summary",
        },
        {
            "id": "measured-configurations", "label": "Measured configurations", "value": str(len(ranked)),
            "detail": f"Across {len({(run['benchmark'], run['benchmarkVersion']) for run in ranked})} benchmark version(s) · refreshed {updated_at}.",
            "accent": "violet", "evidence": "first_party_measured", "sourceRunIds": [run["runId"] for run in ranked], "group": "summary",
        },
        {
            "id": "leader-gap", "label": "Leader gap", "value": f"{(leader['score'] - second['score']) * 100:.1f} pts" if second else "Unavailable",
            "detail": f"Compared with {second['model']} · ranked by measured score." if second else "A second publishable run is required.",
            "accent": "amber", "evidence": leader["evidence"], "sourceRunIds": [leader["runId"], second["runId"]] if second else [leader["runId"]], "group": "summary",
        },
        {
            "id": "evidence-health", "label": "Evidence health", "value": f"{len(verified)}/{len(publishable)} verified",
            "detail": "Accessible, non-warning runs with first-party or independently verified evidence.",
            "accent": "green", "evidence": "first_party_measured", "sourceRunIds": [run["runId"] for run in verified], "group": "summary",
        },
        {
            "id": "top-three", "label": "Top three", "value": str(min(3, len(ranked))),
            "detail": "Ranked publishable configurations by measured benchmark score.", "accent": "cyan",
            "evidence": leader["evidence"], "sourceRunIds": [run["runId"] for run in ranked[:3]], "group": "supporting",
        },
        {
            "id": "largest-harness-difference", "label": "Largest harness difference",
            "value": f"{largest['delta'] * 100:.1f} pts" if largest else "Unavailable",
            "detail": f"{largest['label']} · {largest['benchmark']}" if largest else "No benchmark has multiple harnesses.",
            "accent": "amber", "evidence": "first_party_measured",
            "sourceRunIds": largest["sourceRunIds"] if largest else [], "group": "supporting",
        },
        {
            "id": "research-coverage", "label": "Research coverage", "value": f"{coverage_points[1]['value']}/{coverage_points[-1]['value'] or 0} stages",
            "detail": "Collected, measured, cost-ready, and value-ready evidence stages.", "accent": "violet",
            "evidence": "first_party_measured", "sourceRunIds": [run["runId"] for run in ranked], "group": "supporting",
        },
    ]


def _configuration_records(runs: list[dict[str, Any]], sources: list[dict[str, Any]]) -> list[dict[str, Any]]:
    source_urls = {source["id"]: source["url"] for source in sources}
    records = []
    for run in runs:
        if run.get("integrityWarning") or not run.get("sourceAccessible"):
            continue
        record = {
            "id": run["configurationId"], "runId": run["runId"], "model": run["model"], "provider": run["provider"],
            "harness": run["harness"], "reasoningEffort": run["reasoningEffort"], "benchmark": run["benchmark"],
            "benchmarkVersion": run["benchmarkVersion"], "score": run["score"], "costPerTaskUsd": run.get("costPerTaskUsd"),
            "confidenceIntervalLow": run["confidenceIntervalLow"], "confidenceIntervalHigh": run["confidenceIntervalHigh"],
            "evidence": run["evidence"], "sourceUrl": source_urls[run["sourceId"]],
        }
        if run.get("costPerTaskUsd") is not None:
            record.update({
                "priceSourceId": run["priceSourceId"],
                "priceSourceUrl": source_urls[run["priceSourceId"]],
                "priceEffectiveFrom": run["priceEffectiveFrom"],
            })
        records.append(record)
    return records


def _build_harness_chart(configurations: list[dict[str, Any]]) -> dict[str, Any]:
    groups: dict[tuple[str, str, str, str, str], list[dict[str, Any]]] = defaultdict(list)
    for configuration in configurations:
        groups[(configuration["provider"], configuration["model"], configuration["reasoningEffort"], configuration["benchmark"], configuration["benchmarkVersion"])].append(configuration)
    points = []
    for key, group in sorted(groups.items()):
        harnesses = sorted(group, key=lambda item: (item["score"], item["harness" ]))
        if len(harnesses) < 2:
            continue
        low, high = harnesses[0], harnesses[-1]
        points.append({
            "id": configuration_id({"provider": key[0], "model": key[1], "harness": "comparison", "reasoningEffort": key[2], "benchmark": key[3], "benchmarkVersion": key[4]}),
            "label": key[1], "benchmark": f"{key[3]}@{key[4]}",
            "left": {"label": low["harness"], "value": low["score"]}, "right": {"label": high["harness"], "value": high["score"]},
            "delta": round(high["score"] - low["score"], 6), "sourceRunIds": [low["runId"], high["runId"]],
        })
    return {"id": "harness-comparison", "title": "Harness comparison", "type": "dumbbell", "points": points}


def _build_coverage_chart(
    configurations: list[dict[str, Any]], recommendation: dict[str, Any] | None = None
) -> dict[str, Any]:
    measured = len(configurations)
    cost_ready = sum(configuration.get("costPerTaskUsd") is not None for configuration in configurations)
    all_run_ids = [configuration["runId"] for configuration in configurations]
    cost_ready_run_ids = [
        configuration["runId"] for configuration in configurations
        if configuration.get("costPerTaskUsd") is not None
    ]
    value_ready = int(bool(recommendation and recommendation.get("configurationId") and any(
        configuration["id"] == recommendation["configurationId"]
        and configuration.get("costPerTaskUsd") is not None
        and configuration.get("sourceUrl")
        for configuration in configurations
    )))
    value_ready_run_ids = [
        configuration["runId"] for configuration in configurations
        if recommendation and configuration["id"] == recommendation.get("configurationId")
        and configuration.get("costPerTaskUsd") is not None and configuration.get("sourceUrl")
    ]
    return {
        "id": "research-coverage", "title": "Research coverage", "type": "coverage",
        "points": [
            {"label": "Collected", "value": measured, "sourceRunIds": all_run_ids},
            {"label": "Measured", "value": measured, "sourceRunIds": all_run_ids},
            {"label": "Cost-ready", "value": cost_ready, "sourceRunIds": cost_ready_run_ids},
            {"label": "Value-ready", "value": value_ready, "sourceRunIds": value_ready_run_ids},
        ],
    }


def _is_number(value: Any, minimum: float | None = None, maximum: float | None = None) -> bool:
    return (
        isinstance(value, (int, float)) and not isinstance(value, bool)
        and (minimum is None or value >= minimum) and (maximum is None or value <= maximum)
    )


def _source_run_ids_are_valid(run_ids: Any, available_run_ids: set[str]) -> bool:
    return (
        isinstance(run_ids, list)
        and all(isinstance(run_id, str) and run_id.startswith("sha256:") and run_id in available_run_ids for run_id in run_ids)
    )


def validate_publication_visuals(
    publication: dict[str, Any], normalized_runs: list[dict[str, Any]] | None = None,
) -> list[str]:
    """Validate the published renderer contract against normalized run provenance."""
    errors: list[str] = []
    configurations = publication.get("configurations", [])
    run_records = normalized_runs if normalized_runs is not None else configurations
    runs_by_id = {run.get("runId"): run for run in run_records if isinstance(run.get("runId"), str)}
    configurations_by_id = {configuration.get("id"): configuration for configuration in configurations if isinstance(configuration.get("id"), str)}
    available_run_ids = set(runs_by_id)
    expected_card_ids = {
        "leader", "measured-configurations", "leader-gap", "evidence-health",
        "top-three", "largest-harness-difference", "research-coverage",
    }
    cards = publication.get("dashboardCards", [])
    if not isinstance(cards, list) or len(cards) != 7:
        errors.append("publication requires exactly seven dashboard cards")
    if isinstance(cards, list):
        if {card.get("id") for card in cards if isinstance(card, dict)} != expected_card_ids:
            errors.append("dashboard cards must use the required card IDs")
        if sum(card.get("group") == "summary" for card in cards if isinstance(card, dict)) != 4:
            errors.append("dashboard cards require exactly four summary cards")
        if sum(card.get("group") == "supporting" for card in cards if isinstance(card, dict)) != 3:
            errors.append("dashboard cards require exactly three supporting cards")
        for index, card in enumerate(cards):
            if not isinstance(card, dict):
                errors.append(f"dashboardCards[{index}] must be an object")
                continue
            required_types = {
                "id": str, "label": str, "value": str, "detail": str,
                "accent": str, "evidence": str, "group": str,
            }
            for field, field_type in required_types.items():
                if not isinstance(card.get(field), field_type) or not card.get(field):
                    errors.append(f"dashboardCards[{index}] {field} must be a non-empty {field_type.__name__}")
            if card.get("evidence") not in EVIDENCE:
                errors.append(f"dashboardCards[{index}] has invalid evidence")
            if card.get("group") not in {"summary", "supporting"}:
                errors.append(f"dashboardCards[{index}] has invalid group")
            if not _source_run_ids_are_valid(card.get("sourceRunIds"), available_run_ids):
                errors.append(f"dashboardCards[{index}] references invalid sourceRunIds")

    expected_chart_types = {
        "measured-performance": "ranked_bar",
        "harness-comparison": "dumbbell",
        "research-coverage": "coverage",
    }
    if any(configuration.get("costPerTaskUsd") is not None for configuration in configurations if isinstance(configuration, dict)):
        expected_chart_types["performance-cost"] = "scatter"
    charts = publication.get("charts", [])
    charts_by_id = {chart.get("id"): chart for chart in charts if isinstance(chart, dict)} if isinstance(charts, list) else {}
    if not isinstance(charts, list):
        errors.append("charts must be a list")
        charts = []
    if len(charts_by_id) != len(charts) or set(charts_by_id) != set(expected_chart_types):
        errors.append("publication charts must match the required chart IDs")
    supported_chart_types = {"ranked_bar", "dumbbell", "coverage", "scatter"}
    for index, chart in enumerate(charts):
        if not isinstance(chart, dict) or chart.get("type") not in supported_chart_types:
            errors.append(f"charts[{index}] unknown chart type: {chart.get('type') if isinstance(chart, dict) else None}")
    for chart_id, chart_type in expected_chart_types.items():
        chart = charts_by_id.get(chart_id)
        if not chart:
            errors.append(f"required chart missing: {chart_id}")
            continue
        if chart.get("type") != chart_type:
            errors.append(f"required chart {chart_id} must use type {chart_type}")
            continue
        if not isinstance(chart.get("title"), str) or not chart["title"]:
            errors.append(f"chart {chart_id} title must be a non-empty string")
        if not isinstance(chart.get("points"), list):
            errors.append(f"chart {chart_id} points must be a list")
            continue
        if chart_type in {"ranked_bar", "scatter"}:
            for label in ("xLabel", "yLabel"):
                if not isinstance(chart.get(label), str) or not chart[label]:
                    errors.append(f"chart {chart_id} {label} must be a non-empty string")
        if chart_type == "ranked_bar":
            for index, point in enumerate(chart["points"]):
                prefix = f"ranked point {index}"
                if not isinstance(point, dict) or not all(field in point for field in ("configurationId", "label", "value", "low", "high", "sourceRunIds")):
                    errors.append(f"{prefix} missing required field or sourceRunIds")
                    continue
                if not isinstance(point["configurationId"], str) or not isinstance(point["label"], str):
                    errors.append(f"{prefix} configurationId and label must be strings")
                if not all(_is_number(point[field], 0, 1) for field in ("value", "low", "high")):
                    errors.append(f"{prefix} values must be numeric and between 0 and 1")
                elif not point["low"] <= point["value"] <= point["high"]:
                    errors.append(f"{prefix} interval must contain value in ascending order")
                run = runs_by_id.get(point["sourceRunIds"][0]) if isinstance(point.get("sourceRunIds"), list) and len(point["sourceRunIds"]) == 1 else None
                if not run or not _source_run_ids_are_valid(point.get("sourceRunIds"), available_run_ids):
                    errors.append(f"{prefix} sourceRunIds must reference exactly one normalized run")
                elif point.get("configurationId") != run.get("configurationId") or not math.isclose(float(point["value"]), float(run["score"])):
                    errors.append(f"{prefix} sourceRunIds do not match its configuration and score")
        elif chart_type == "dumbbell":
            for index, point in enumerate(chart["points"]):
                prefix = f"dumbbell point {index}"
                if not isinstance(point, dict) or not all(field in point for field in ("id", "label", "benchmark", "left", "right", "delta", "sourceRunIds")):
                    errors.append(f"{prefix} missing required field")
                    continue
                endpoints = (point.get("left"), point.get("right"))
                if not all(isinstance(endpoint, dict) and isinstance(endpoint.get("label"), str) and _is_number(endpoint.get("value"), 0, 1) for endpoint in endpoints):
                    errors.append(f"{prefix} endpoint must have a string label and numeric value between 0 and 1")
                    continue
                if not _is_number(point.get("delta"), 0, 1) or not math.isclose(float(point["delta"]), abs(float(point["right"]["value"]) - float(point["left"]["value"]))):
                    errors.append(f"{prefix} delta must match its endpoint values")
                run_ids = point.get("sourceRunIds")
                if not _source_run_ids_are_valid(run_ids, available_run_ids) or not isinstance(run_ids, list) or len(run_ids) != 2 or len(set(run_ids)) != 2:
                    errors.append(f"{prefix} sourceRunIds must reference exactly two normalized runs")
                    continue
                left_run, right_run = (runs_by_id[run_id] for run_id in run_ids)
                semantics = ("provider", "model", "reasoningEffort", "benchmark", "benchmarkVersion")
                if any(left_run.get(field) != right_run.get(field) for field in semantics):
                    errors.append(f"{prefix} endpoints must share provider, model, effort, benchmark, and benchmark version")
                if point["left"]["label"] != left_run.get("harness") or point["right"]["label"] != right_run.get("harness") or not math.isclose(float(point["left"]["value"]), float(left_run["score"])) or not math.isclose(float(point["right"]["value"]), float(right_run["score"])):
                    errors.append(f"{prefix} endpoints do not match their exact source runs")
                if point.get("benchmark") != f"{left_run['benchmark']}@{left_run['benchmarkVersion']}":
                    errors.append(f"{prefix} benchmark must match its endpoint benchmark version")
        elif chart_type == "coverage":
            expected_labels = {"Collected", "Measured", "Cost-ready", "Value-ready"}
            points_by_label = {point.get("label"): point for point in chart["points"] if isinstance(point, dict)}
            if len(points_by_label) != len(chart["points"]) or set(points_by_label) != expected_labels:
                errors.append("coverage chart must contain each required stage exactly once")
            for label, point in points_by_label.items():
                if not isinstance(point.get("value"), int) or isinstance(point.get("value"), bool) or point["value"] < 0:
                    errors.append(f"coverage point {label} value must be a non-negative integer")
                if not _source_run_ids_are_valid(point.get("sourceRunIds"), available_run_ids):
                    errors.append(f"coverage point {label} references invalid sourceRunIds")
        elif chart_type == "scatter":
            for index, point in enumerate(chart["points"]):
                prefix = f"scatter point {index}"
                required = ("configurationId", "x", "y", "sourceRunIds", "priceSourceId", "priceSourceUrl", "priceEffectiveFrom")
                if not isinstance(point, dict) or not all(field in point for field in required):
                    errors.append(f"{prefix} missing required provenance field")
                    continue
                if not isinstance(point["configurationId"], str) or not _is_number(point["x"], 0) or not _is_number(point["y"], 0, 1):
                    errors.append(f"{prefix} configurationId, cost, and score must have valid types and bounds")
                run = runs_by_id.get(point["sourceRunIds"][0]) if isinstance(point.get("sourceRunIds"), list) and len(point["sourceRunIds"]) == 1 else None
                if not run or not _source_run_ids_are_valid(point.get("sourceRunIds"), available_run_ids):
                    errors.append(f"{prefix} sourceRunIds must reference exactly one cost-ready normalized run")
                    continue
                if (
                    point["configurationId"] != run.get("configurationId")
                    or run.get("costPerTaskUsd") is None
                    or not math.isclose(float(point["x"]), float(run["costPerTaskUsd"]))
                    or not math.isclose(float(point["y"]), float(run["score"]))
                    or point["priceSourceId"] != run.get("priceSourceId")
                    or point["priceEffectiveFrom"] != run.get("priceEffectiveFrom")
                ):
                    errors.append(f"{prefix} sourceRunIds or priceSourceId do not match its normalized run")
                configuration = configurations_by_id.get(point["configurationId"])
                if not configuration or point["priceSourceUrl"] != configuration.get("priceSourceUrl"):
                    errors.append(f"{prefix} priceSourceUrl does not match its cost-ready configuration")

    for configuration in configurations:
        if not isinstance(configuration, dict):
            errors.append("configuration must be an object")
            continue
        if configuration.get("costPerTaskUsd") is not None:
            for field in ("priceSourceId", "priceSourceUrl", "priceEffectiveFrom"):
                if not isinstance(configuration.get(field), str) or not configuration[field]:
                    errors.append(f"cost-ready configuration {configuration.get('id')} missing {field}")
            run = runs_by_id.get(configuration.get("runId"))
            if run and (
                configuration.get("priceSourceId") != run.get("priceSourceId")
                or configuration.get("priceEffectiveFrom") != run.get("priceEffectiveFrom")
            ):
                errors.append(f"cost-ready configuration {configuration.get('id')} price provenance does not match its normalized run")

    recommendation = publication.get("recommendation", {})
    recommendation_id = recommendation.get("configurationId") if isinstance(recommendation, dict) else None
    if recommendation_id is not None:
        configuration = configurations_by_id.get(recommendation_id)
        run = runs_by_id.get(configuration.get("runId")) if configuration else None
        if not run or recommendation.get("sourceRunIds") != [run["runId"]]:
            errors.append("recommendation sourceRunIds must reference its exact normalized run")
        if not run or recommendation.get("priceSourceId") != run.get("priceSourceId") or recommendation.get("priceEffectiveFrom") != run.get("priceEffectiveFrom"):
            errors.append("recommendation pricing provenance must match its exact normalized run")
    return errors


def snapshot_filename(bundle: dict[str, Any], publication: dict[str, Any]) -> str:
    return f"{slug(bundle['run']['runId'])}-v{publication['schemaVersion']}.json"


def build_publication(normalized: dict[str, Any]) -> dict[str, Any]:
    runs = normalized["benchmarkRuns"]
    frontiers = compute_pareto_frontier(runs)
    recommendation = _select_recommendation(runs)
    publishable_configurations = _configuration_records(runs, normalized["sources"])
    current_cohort = _select_current_cohort([
        run for run in runs if run.get("sourceAccessible") and not run.get("integrityWarning")
    ])
    configurations = publishable_configurations
    ranked_configurations = _configuration_records(current_cohort, normalized["sources"])
    points = [
        {
            "configurationId": item["id"], "x": item["costPerTaskUsd"], "y": item["score"],
            "sourceRunIds": [item["runId"]], "priceSourceId": item["priceSourceId"],
            "priceSourceUrl": item["priceSourceUrl"], "priceEffectiveFrom": item["priceEffectiveFrom"],
        }
        for item in configurations if item["costPerTaskUsd"] is not None
    ]
    score_points = [
        {
            "configurationId": item["id"],
            "label": f"{item['model']} · {item['harness']}",
            "value": item["score"],
            "low": item["confidenceIntervalLow"],
            "high": item["confidenceIntervalHigh"],
            "sourceRunIds": [item["runId"]],
        }
        for item in sorted(ranked_configurations, key=lambda record: record["score"], reverse=True)
    ]
    charts = [{
        "id": "measured-performance", "title": "Measured performance", "type": "ranked_bar",
        "xLabel": "Configuration", "yLabel": "Benchmark pass rate", "points": score_points,
    }]
    if points:
        charts.append({
            "id": "performance-cost", "title": "Performance versus API cost", "type": "scatter",
            "xLabel": "Median task cost (USD)", "yLabel": "Benchmark pass rate", "points": points,
            "frontiers": frontiers,
        })
    charts.extend([_build_harness_chart(publishable_configurations), _build_coverage_chart(publishable_configurations, recommendation)])
    updated = normalized["run"]["retrievedAt"][:10]
    return {
        "schemaVersion": 2, "updatedAt": updated, "title": "Coding Agent Value Lab",
        "subtitle": "Independent analysis of coding models, harnesses, reasoning levels, costs, and subscription efficiency.",
        "positioning": "Benchmarks tell you who scored highest. This lab tells you what to use.",
        "status": f"{len(publishable_configurations)} publishable configurations · refreshed {updated}",
        "recommendation": recommendation, "alternatives": [],
        "controls": {
            "workloads": [{"id": value, "label": value.title()} for value in ("small", "medium", "large", "xl")],
            "accessModes": [{"id": "both", "label": "Subscription + API"}, {"id": "subscription", "label": "Subscription"}, {"id": "api", "label": "API"}],
            "goals": [{"id": "value", "label": "Best value"}, {"id": "quality", "label": "Best quality"}, {"id": "throughput", "label": "Most work per window"}, {"id": "speed", "label": "Fastest"}],
        },
        "insights": _generate_insights(runs), "configurations": configurations,
        "dashboardCards": _build_dashboard_cards(current_cohort, normalized["sources"], updated, recommendation),
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
    visual_errors = validate_publication_visuals(publication, normalized["benchmarkRuns"])
    if visual_errors:
        gate = {
            "requiresReview": True,
            "reasons": ["publication visuals failed validation"],
            "validationErrors": visual_errors,
        }
        if args.gate_output:
            args.gate_output.parent.mkdir(parents=True, exist_ok=True)
            args.gate_output.write_text(json.dumps(gate, indent=2, sort_keys=True) + "\n")
        print(json.dumps({"gate": gate}, sort_keys=True))
        return 2
    snapshot = args.snapshot_root / publication["updatedAt"] / snapshot_filename(bundle, publication)
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
