import json
import sys
import tempfile
import unittest
from copy import deepcopy
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SCRIPT_DIR))

from value_lab_pipeline import (  # noqa: E402
    _build_harness_chart,
    build_publication,
    calculate_api_cost,
    compute_pareto_frontier,
    evaluate_change_gate,
    normalize_bundle,
    validate_publication_visuals,
    validate_bundle,
    write_publication,
)


def sample_bundle():
    return {
        "run": {"runId": "2026-07-13T120000Z", "retrievedAt": "2026-07-13T12:00:00Z"},
        "sources": [
            {
                "id": "terminal-bench-2-1",
                "kind": "benchmark",
                "url": "https://www.tbench.ai/leaderboard/terminal-bench/2.1",
                "retrievedAt": "2026-07-13T12:00:00Z",
                "accessible": True,
            }
        ],
        "benchmarkRuns": [
            {
                "provider": "OpenAI", "model": "Model A", "harness": "Harness X",
                "reasoningEffort": "medium", "benchmark": "terminal-bench",
                "benchmarkVersion": "2.1", "score": 0.60, "taskCount": 100,
                "inputTokens": 100000, "cachedInputTokens": 20000, "outputTokens": 10000,
                "evaluatedAt": "2026-07-10", "sourceId": "terminal-bench-2-1",
                "evidence": "official_verified",
            },
            {
                "provider": "OpenAI", "model": "Model B", "harness": "Harness X",
                "reasoningEffort": "high", "benchmark": "terminal-bench",
                "benchmarkVersion": "2.1", "score": 0.61, "taskCount": 100,
                "inputTokens": 180000, "cachedInputTokens": 20000, "outputTokens": 18000,
                "evaluatedAt": "2026-07-10", "sourceId": "terminal-bench-2-1",
                "evidence": "official_verified",
            },
        ],
        "prices": [
            {
                "provider": "OpenAI", "model": "Model A", "inputPerMillionUsd": 2.0,
                "cachedInputPerMillionUsd": 0.5, "outputPerMillionUsd": 8.0,
                "effectiveFrom": "2026-07-01", "sourceId": "terminal-bench-2-1",
            },
            {
                "provider": "OpenAI", "model": "Model B", "inputPerMillionUsd": 4.0,
                "cachedInputPerMillionUsd": 1.0, "outputPerMillionUsd": 16.0,
                "effectiveFrom": "2026-07-01", "sourceId": "terminal-bench-2-1",
            },
        ],
        "plans": [], "quotaObservations": [], "integrityNotices": [],
    }


def mixed_cost_readiness_bundle():
    """One cost-ready run and one measured-only run with distinct source families."""
    bundle = sample_bundle()
    bundle["sources"].append({
        "id": "openai-pricing-2026-07",
        "kind": "pricing",
        "url": "https://openai.com/api/pricing/",
        "retrievedAt": "2026-07-13T12:00:00Z",
        "accessible": True,
    })
    bundle["prices"][0]["sourceId"] = "openai-pricing-2026-07"
    bundle["prices"][1]["sourceId"] = "openai-pricing-2026-07"
    for field in ("inputTokens", "cachedInputTokens", "outputTokens"):
        bundle["benchmarkRuns"][1].pop(field)
    return bundle


def cost_ready_harness_bundle():
    bundle = mixed_cost_readiness_bundle()
    alternate = deepcopy(bundle["benchmarkRuns"][0])
    alternate.update({"harness": "Harness Y", "score": 0.64})
    bundle["benchmarkRuns"].append(alternate)
    return bundle


class ValueLabPipelineTests(unittest.TestCase):
    def test_weekly_changes_uses_baseline_without_older_publication(self):
        publication = build_publication(normalize_bundle(sample_bundle()))

        self.assertEqual(publication["schemaVersion"], 3)
        self.assertEqual(publication["weeklyChanges"], {
            "title": "What's Changed Since Last Week?",
            "baselineDate": None,
            "currentDate": "2026-07-13",
            "status": "baseline",
            "items": [],
        })

    def test_same_day_previous_publication_is_not_a_weekly_comparison(self):
        previous = build_publication(normalize_bundle(sample_bundle()))

        current = build_publication(normalize_bundle(sample_bundle()), previous)

        self.assertEqual(current["weeklyChanges"]["status"], "baseline")

    def test_weekly_changes_are_deterministic_and_capped_at_four(self):
        previous_bundle = sample_bundle()
        previous_bundle["run"].update({
            "runId": "2026-07-06T120000Z",
            "retrievedAt": "2026-07-06T12:00:00Z",
        })
        previous = build_publication(normalize_bundle(previous_bundle))

        current_a = build_publication(normalize_bundle(sample_bundle()), previous)
        current_b = build_publication(normalize_bundle(sample_bundle()), previous)

        self.assertEqual(current_a["weeklyChanges"], current_b["weeklyChanges"])
        self.assertEqual(current_a["weeklyChanges"]["status"], "compared")
        self.assertLessEqual(len(current_a["weeklyChanges"]["items"]), 4)

    def test_weekly_change_validation_rejects_unknown_marker_and_run(self):
        prior_bundle = sample_bundle()
        prior_bundle["run"].update({
            "runId": "2026-07-06T120000Z",
            "retrievedAt": "2026-07-06T12:00:00Z",
        })
        previous = build_publication(normalize_bundle(prior_bundle))
        publication = build_publication(normalize_bundle(sample_bundle()), previous)
        item = publication["weeklyChanges"]["items"][0]
        item["marker"] = "new"
        item["sourceRunIds"] = ["sha256:unknown"]

        errors = validate_publication_visuals(publication, previous=previous)

        self.assertTrue(any("weeklyChanges" in error and "marker" in error for error in errors))
        self.assertTrue(any("weeklyChanges" in error and "sourceRunIds" in error for error in errors))

    def test_weekly_change_validation_rejects_non_https_sources(self):
        publication = build_publication(normalize_bundle(sample_bundle()))
        publication["weeklyChanges"] = {
            "title": "What's Changed Since Last Week?",
            "baselineDate": "2026-07-06",
            "currentDate": "2026-07-13",
            "status": "compared",
            "items": [{
                "id": "bad",
                "marker": "up",
                "headline": "Bad source.",
                "evidence": "official_verified",
                "sourceRunIds": [],
                "sources": [{"label": "Bad", "url": "http://example.com"}],
            }],
        }

        errors = validate_publication_visuals(publication)

        self.assertTrue(any("weeklyChanges" in error and "HTTPS" in error for error in errors))

    def test_weekly_change_validation_rejects_noncanonical_claim(self):
        prior_bundle = sample_bundle()
        prior_bundle["run"].update({
            "runId": "2026-07-06T120000Z",
            "retrievedAt": "2026-07-06T12:00:00Z",
        })
        previous = build_publication(normalize_bundle(prior_bundle))
        publication = build_publication(normalize_bundle(sample_bundle()), previous)
        publication["weeklyChanges"]["items"][0]["headline"] = "Fabricated movement."

        errors = validate_publication_visuals(publication, previous=previous)

        self.assertTrue(any("weeklyChanges must match deterministic comparison" in error for error in errors))

    def test_weekly_changes_detects_leader_and_frontier_changes_with_cohort_provenance(self):
        prior_bundle = sample_bundle()
        prior_bundle["run"].update({
            "runId": "2026-07-06T120000Z",
            "retrievedAt": "2026-07-06T12:00:00Z",
        })
        prior_bundle["benchmarkRuns"][0]["score"] = 0.62
        previous = build_publication(normalize_bundle(prior_bundle))

        publication = build_publication(normalize_bundle(sample_bundle()), previous)
        items = {item["id"]: item for item in publication["weeklyChanges"]["items"]}
        frontier = next(item for item in items.values() if item["id"].startswith("frontier-entry"))
        leader = next(item for item in items.values() if item["id"].startswith("leader-change"))
        expected_cohort_runs = {
            configuration["runId"]
            for source in (previous, publication)
            for configuration in source["configurations"]
            if configuration["benchmark"] == "terminal-bench"
            and configuration["benchmarkVersion"] == "2.1"
        }

        self.assertEqual(frontier["marker"], "up")
        self.assertEqual(set(frontier["sourceRunIds"]), expected_cohort_runs)
        self.assertEqual(leader["marker"], "up")
        self.assertIn("became the leader", leader["headline"])

    def test_weekly_changes_detects_recommendation_and_task_cost_changes(self):
        prior_bundle = sample_bundle()
        prior_bundle["run"].update({
            "runId": "2026-07-06T120000Z",
            "retrievedAt": "2026-07-06T12:00:00Z",
        })
        previous = build_publication(normalize_bundle(prior_bundle))
        current_bundle = sample_bundle()
        current_bundle["prices"][1].update({
            "inputPerMillionUsd": 0.2,
            "cachedInputPerMillionUsd": 0.05,
            "outputPerMillionUsd": 0.8,
        })

        publication = build_publication(normalize_bundle(current_bundle), previous)
        items = publication["weeklyChanges"]["items"]
        recommendation = next(item for item in items if item["id"].startswith("value-recommendation"))
        cost = next(item for item in items if item["id"].startswith("task-cost-down"))

        self.assertEqual(recommendation["marker"], "star")
        self.assertIn("highest-value measured configuration", recommendation["headline"])
        self.assertEqual(cost["marker"], "down")
        self.assertIn("measured task cost fell", cost["headline"])

    def test_weekly_changes_can_report_no_material_change_for_disjoint_measured_cohorts(self):
        prior_bundle = sample_bundle()
        prior_bundle["run"].update({
            "runId": "2026-07-06T120000Z",
            "retrievedAt": "2026-07-06T12:00:00Z",
        })
        current_bundle = sample_bundle()
        for bundle in (prior_bundle, current_bundle):
            bundle["prices"] = []
            for run in bundle["benchmarkRuns"]:
                for field in ("inputTokens", "cachedInputTokens", "outputTokens"):
                    run.pop(field)
        for run in current_bundle["benchmarkRuns"]:
            run["benchmarkVersion"] = "2.2"
        previous = build_publication(normalize_bundle(prior_bundle))

        publication = build_publication(normalize_bundle(current_bundle), previous)

        self.assertEqual(publication["weeklyChanges"]["status"], "compared")
        self.assertEqual(publication["weeklyChanges"]["items"], [])

    def test_mixed_cost_readiness_preserves_exact_benchmark_and_pricing_lineage(self):
        normalized = normalize_bundle(mixed_cost_readiness_bundle())
        publication = build_publication(normalized)
        cost_ready_run = next(run for run in normalized["benchmarkRuns"] if run["model"] == "Model A")
        measured_only_run = next(run for run in normalized["benchmarkRuns"] if run["model"] == "Model B")
        cost_ready = next(configuration for configuration in publication["configurations"] if configuration["id"] == cost_ready_run["configurationId"])
        scatter = next(chart for chart in publication["charts"] if chart["id"] == "performance-cost")
        point = scatter["points"][0]

        self.assertEqual(len(scatter["points"]), 1)
        self.assertEqual(point["configurationId"], cost_ready_run["configurationId"])
        self.assertEqual(point["sourceRunIds"], [cost_ready_run["runId"]])
        self.assertEqual(point["priceSourceId"], cost_ready_run["priceSourceId"])
        self.assertEqual(point["priceSourceUrl"], cost_ready["priceSourceUrl"])
        self.assertEqual(point["priceEffectiveFrom"], cost_ready_run["priceEffectiveFrom"])
        self.assertEqual(publication["recommendation"]["sourceRunIds"], [cost_ready_run["runId"]])
        self.assertEqual(publication["recommendation"]["priceSourceId"], cost_ready_run["priceSourceId"])
        self.assertIsNone(measured_only_run.get("costPerTaskUsd"))
        self.assertNotIn(measured_only_run["configurationId"], [item["configurationId"] for item in scatter["points"]])
        self.assertNotIn(measured_only_run["runId"], point["sourceRunIds"])

    def test_visual_validation_rejects_coverage_count_that_differs_from_source_runs(self):
        normalized = normalize_bundle(mixed_cost_readiness_bundle())
        publication = build_publication(normalized)
        coverage = next(chart for chart in publication["charts"] if chart["id"] == "research-coverage")
        point = next(point for point in coverage["points"] if point["label"] == "Cost-ready")
        point["value"] = 0

        errors = validate_publication_visuals(publication, normalized["benchmarkRuns"])

        self.assertTrue(any("coverage point Cost-ready" in error and "value must equal sourceRunIds length" in error for error in errors))

    def test_visual_validation_rejects_coverage_runs_that_are_valid_but_ineligible(self):
        normalized = normalize_bundle(mixed_cost_readiness_bundle())
        publication = build_publication(normalized)
        measured_only_run = next(run for run in normalized["benchmarkRuns"] if run["model"] == "Model B")
        coverage = next(chart for chart in publication["charts"] if chart["id"] == "research-coverage")
        point = next(point for point in coverage["points"] if point["label"] == "Cost-ready")
        point["sourceRunIds"] = [measured_only_run["runId"]]

        errors = validate_publication_visuals(publication, normalized["benchmarkRuns"])

        self.assertTrue(any("coverage point Cost-ready" in error and "sourceRunIds must exactly match eligible runs" in error for error in errors))

    def test_visual_validation_requires_exact_card_and_chart_contract(self):
        normalized = normalize_bundle(sample_bundle())
        publication = build_publication(normalized)
        publication["dashboardCards"].pop()
        publication["charts"] = [chart for chart in publication["charts"] if chart["id"] != "research-coverage"]

        errors = validate_publication_visuals(publication)

        self.assertTrue(any("exactly seven dashboard cards" in error for error in errors))
        self.assertTrue(any("required chart" in error and "research-coverage" in error for error in errors))

    def test_visual_validation_rejects_invalid_numeric_intervals_and_endpoint_semantics(self):
        normalized = normalize_bundle(cost_ready_harness_bundle())
        publication = build_publication(normalized)
        ranked = next(chart for chart in publication["charts"] if chart["id"] == "measured-performance")
        dumbbell = next(chart for chart in publication["charts"] if chart["id"] == "harness-comparison")
        ranked["points"][0].update({"value": "0.64", "low": 0.7, "high": 0.6})
        ranked["points"][1].update({"value": 0.6, "low": 0.7, "high": 0.6})
        dumbbell["points"][0]["right"] = {"label": "Harness Y", "value": 1.1}

        errors = validate_publication_visuals(publication)

        self.assertTrue(any("ranked point" in error and "numeric" in error for error in errors))
        self.assertTrue(any("ranked point" in error and "interval" in error for error in errors))
        self.assertTrue(any("dumbbell" in error and "endpoint" in error for error in errors))

    def test_visual_validation_requires_scatter_source_run_and_price_lineage(self):
        normalized = normalize_bundle(mixed_cost_readiness_bundle())
        publication = build_publication(normalized)
        bad_source_run = deepcopy(publication)
        next(chart for chart in bad_source_run["charts"] if chart["id"] == "performance-cost")["points"][0]["sourceRunIds"] = ["sha256:wrong"]
        bad_price_source = deepcopy(publication)
        next(chart for chart in bad_price_source["charts"] if chart["id"] == "performance-cost")["points"][0]["priceSourceId"] = "wrong-price-source"

        errors = validate_publication_visuals(bad_source_run) + validate_publication_visuals(bad_price_source)

        self.assertTrue(any("scatter point" in error and "sourceRunIds" in error for error in errors))
        self.assertTrue(any("scatter point" in error and "priceSourceId" in error for error in errors))

    def test_dashboard_cards_are_generated_from_publishable_runs(self):
        publication = build_publication(normalize_bundle(sample_bundle()))
        cards = {card["id"]: card for card in publication["dashboardCards"]}
        self.assertEqual(publication["schemaVersion"], 3)
        self.assertEqual(cards["leader"]["value"], "61.0%")
        self.assertEqual(cards["measured-configurations"]["value"], "2")
        self.assertEqual(cards["leader-gap"]["value"], "1.0 pts")
        self.assertEqual(cards["evidence-health"]["value"], "2/2 verified")
        self.assertTrue(cards["leader"]["sourceRunIds"])
        self.assertEqual(len(publication["dashboardCards"]), 7)
        self.assertEqual(sum(card["group"] == "summary" for card in publication["dashboardCards"]), 4)
        self.assertEqual(sum(card["group"] == "supporting" for card in publication["dashboardCards"]), 3)

    def test_dashboard_charts_include_rank_harness_and_coverage(self):
        publication = build_publication(normalize_bundle(sample_bundle()))
        charts = {chart["id"]: chart for chart in publication["charts"]}
        self.assertEqual(charts["measured-performance"]["type"], "ranked_bar")
        self.assertEqual(charts["harness-comparison"]["type"], "dumbbell")
        self.assertEqual(charts["research-coverage"]["type"], "coverage")
        self.assertEqual(charts["research-coverage"]["points"][1]["value"], 2)
        self.assertEqual(charts["research-coverage"]["points"][2]["value"], 2)
        self.assertEqual(charts["research-coverage"]["points"][3]["value"], 1)

    def test_rank_cards_and_chart_use_one_current_benchmark_version_cohort(self):
        bundle = sample_bundle()
        older = dict(bundle["benchmarkRuns"][0])
        older.update({"benchmarkVersion": "2.0", "score": 0.99})
        bundle["benchmarkRuns"].append(older)
        publication = build_publication(normalize_bundle(bundle))
        cards = {card["id"]: card for card in publication["dashboardCards"]}
        current_ids = {
            configuration["runId"] for configuration in publication["configurations"]
            if configuration["benchmarkVersion"] == "2.1"
        }
        self.assertEqual(cards["leader"]["value"], "61.0%")
        self.assertEqual(set(cards["leader"]["sourceRunIds"]), {cards["leader"]["sourceRunIds"][0]})
        self.assertTrue(set(cards["top-three"]["sourceRunIds"]).issubset(current_ids))
        ranked = next(chart for chart in publication["charts"] if chart["id"] == "measured-performance")
        self.assertTrue(all(point["configurationId"] in {
            configuration["id"] for configuration in publication["configurations"]
            if configuration["benchmarkVersion"] == "2.1"
        } for point in ranked["points"]))

    def test_coverage_counts_cost_ready_and_value_ready_configurations(self):
        publication = build_publication(normalize_bundle(sample_bundle()))
        coverage = next(chart for chart in publication["charts"] if chart["id"] == "research-coverage")
        values = {point["label"]: point["value"] for point in coverage["points"]}
        self.assertEqual(values["Cost-ready"], 2)
        self.assertEqual(values["Value-ready"], 1)

    def test_ranked_and_coverage_points_include_exact_supporting_run_ids(self):
        publication = build_publication(normalize_bundle(sample_bundle()))
        all_run_ids = {configuration["runId"] for configuration in publication["configurations"]}
        ranked = next(chart for chart in publication["charts"] if chart["id"] == "measured-performance")
        self.assertTrue(all(point.get("sourceRunIds") == [
            next(configuration["runId"] for configuration in publication["configurations"]
                if configuration["id"] == point["configurationId"])
        ] for point in ranked["points"]))
        coverage = next(chart for chart in publication["charts"] if chart["id"] == "research-coverage")
        points = {point["label"]: point for point in coverage["points"]}
        self.assertEqual(set(points["Collected"]["sourceRunIds"]), all_run_ids)
        self.assertEqual(set(points["Measured"]["sourceRunIds"]), all_run_ids)
        self.assertEqual(set(points["Cost-ready"]["sourceRunIds"]), all_run_ids)
        recommendation_id = publication["recommendation"]["configurationId"]
        recommendation_run_id = next(configuration["runId"] for configuration in publication["configurations"] if configuration["id"] == recommendation_id)
        self.assertEqual(points["Value-ready"]["sourceRunIds"], [recommendation_run_id])

    def test_visual_validation_rejects_missing_or_unknown_ranked_and_coverage_sources(self):
        publication = build_publication(normalize_bundle(sample_bundle()))
        ranked = next(chart for chart in publication["charts"] if chart["id"] == "measured-performance")
        coverage = next(chart for chart in publication["charts"] if chart["id"] == "research-coverage")
        ranked["points"][0].pop("sourceRunIds", None)
        coverage["points"][0]["sourceRunIds"] = ["sha256:unknown"]
        errors = validate_publication_visuals(publication)
        self.assertTrue(any("ranked" in error and "sourceRunIds" in error for error in errors))
        self.assertTrue(any("coverage" in error and "sourceRunIds" in error for error in errors))

    def test_harness_chart_never_pairs_different_benchmark_versions(self):
        bundle = sample_bundle()
        bundle["benchmarkRuns"][1]["benchmarkVersion"] = "2.0"
        chart = _build_harness_chart(build_publication(normalize_bundle(bundle))["configurations"])
        self.assertEqual(chart["points"], [])

    def test_publication_visual_validation_rejects_malformed_shapes(self):
        publication = build_publication(normalize_bundle(sample_bundle()))
        publication["dashboardCards"][0].pop("sourceRunIds")
        publication["charts"][0]["type"] = "unknown"
        errors = validate_publication_visuals(publication)
        self.assertTrue(any("sourceRunIds" in error for error in errors))
        self.assertTrue(any("unknown chart type" in error for error in errors))

    def test_api_cost_uses_uncached_cached_and_output_prices(self):
        cost = calculate_api_cost(100000, 20000, 10000, 2.0, 0.5, 8.0)
        self.assertAlmostEqual(cost, 0.25)

    def test_normalize_bundle_creates_stable_ids_and_derived_cost(self):
        normalized = normalize_bundle(sample_bundle())
        first = normalized["benchmarkRuns"][0]
        self.assertEqual(first["configurationId"], "openai-model-a__harness-x__medium__terminal-bench-2-1")
        self.assertAlmostEqual(first["costPerTaskUsd"], 0.25)
        self.assertAlmostEqual(first["expectedSolvedTasksPerDollar"], 2.4)

    def test_validation_rejects_unknown_sources_and_impossible_scores(self):
        bundle = sample_bundle()
        bundle["benchmarkRuns"][0]["score"] = 1.2
        bundle["benchmarkRuns"][1]["sourceId"] = "missing"
        errors = validate_bundle(bundle)
        self.assertTrue(any("score" in error for error in errors))
        self.assertTrue(any("unknown source" in error for error in errors))

    def test_pareto_frontier_never_mixes_benchmark_versions(self):
        records = [
            {"configurationId": "a", "benchmark": "tb", "benchmarkVersion": "2.0", "score": 0.5, "costPerTaskUsd": 0.2},
            {"configurationId": "b", "benchmark": "tb", "benchmarkVersion": "2.1", "score": 0.6, "costPerTaskUsd": 0.3},
            {"configurationId": "c", "benchmark": "tb", "benchmarkVersion": "2.1", "score": 0.55, "costPerTaskUsd": 0.5},
        ]
        frontier = compute_pareto_frontier(records)
        self.assertEqual(frontier["tb@2.0"], ["a"])
        self.assertEqual(frontier["tb@2.1"], ["b"])

    def test_recommendation_never_compares_across_benchmark_versions(self):
        bundle = sample_bundle()
        older = dict(bundle["benchmarkRuns"][0])
        older.update({"benchmarkVersion": "2.0", "score": 0.99, "evaluatedAt": "2026-01-01"})
        bundle["benchmarkRuns"].append(older)
        publication = build_publication(normalize_bundle(bundle))
        self.assertIn("terminal-bench-2-1", publication["recommendation"]["configurationId"])

    def test_price_join_uses_latest_rate_effective_on_evaluation_date(self):
        bundle = sample_bundle()
        bundle["prices"].append({
            "provider": "OpenAI", "model": "Model A", "inputPerMillionUsd": 200.0,
            "cachedInputPerMillionUsd": 50.0, "outputPerMillionUsd": 800.0,
            "effectiveFrom": "2026-08-01", "sourceId": "terminal-bench-2-1",
        })
        first = normalize_bundle(bundle)["benchmarkRuns"][0]
        self.assertAlmostEqual(first["costPerTaskUsd"], 0.25)

    def test_unavailable_source_is_reviewable_not_a_schema_error(self):
        bundle = sample_bundle()
        bundle["sources"][0]["accessible"] = False
        self.assertFalse(any("source unavailable" in error for error in validate_bundle(bundle)))
        gate = evaluate_change_gate(None, {"configurations": [], "recommendation": {}}, 0, 2, ["terminal-bench-2-1"], [])
        self.assertTrue(gate["requiresReview"])

    def test_active_integrity_notice_requires_review(self):
        gate = evaluate_change_gate(None, {"configurations": [], "recommendation": {}}, 0, 1, [], ["retracted-run"])
        self.assertTrue(gate["requiresReview"])
        self.assertTrue(any("integrity" in reason for reason in gate["reasons"]))

    def test_validation_rejects_invalid_price_and_token_shapes(self):
        bundle = sample_bundle()
        bundle["prices"][0].pop("effectiveFrom")
        bundle["benchmarkRuns"][0]["cachedInputTokens"] = 120000
        errors = validate_bundle(bundle)
        self.assertTrue(any("effectiveFrom" in error for error in errors))
        self.assertTrue(any("cachedInputTokens" in error for error in errors))

    def test_change_gate_requires_review_for_material_changes(self):
        previous = {"configurations": [{"id": "a", "score": 0.50, "costPerTaskUsd": 1.0}], "recommendation": {"configurationId": "a"}}
        current = {"configurations": [{"id": "a", "score": 0.56, "costPerTaskUsd": 1.25}], "recommendation": {"configurationId": "b"}}
        gate = evaluate_change_gate(previous, current, 0, 1, [], [])
        self.assertTrue(gate["requiresReview"])
        self.assertGreaterEqual(len(gate["reasons"]), 3)

    def test_end_to_end_build_is_deterministic_and_writes_snapshot(self):
        normalized = normalize_bundle(sample_bundle())
        publication_a = build_publication(normalized)
        publication_b = build_publication(normalized)
        self.assertEqual(publication_a, publication_b)
        self.assertEqual(publication_a["recommendation"]["configurationId"], "openai-model-a__harness-x__medium__terminal-bench-2-1")
        insight = publication_a["insights"][0]
        self.assertEqual(insight["type"], "near_equal_lower_cost")
        self.assertEqual(insight["facts"]["scoreDelta"], -0.01)
        self.assertEqual(len(insight["sourceRunIds"]), 2)

        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            current = root / "src/data/value-lab/current.json"
            snapshot = root / "src/data/value-lab/snapshots/2026-07-13/current.json"
            write_publication(publication_a, current, snapshot)
            self.assertEqual(json.loads(current.read_text()), json.loads(snapshot.read_text()))

    def test_score_chart_is_published_when_cost_inputs_are_missing(self):
        bundle = sample_bundle()
        bundle["prices"] = []
        for run in bundle["benchmarkRuns"]:
            run.pop("inputTokens")
            run.pop("cachedInputTokens")
            run.pop("outputTokens")
        publication = build_publication(normalize_bundle(bundle))
        chart = publication["charts"][0]
        self.assertEqual(chart["type"], "ranked_bar")
        self.assertEqual(len(chart["points"]), 2)
        self.assertIsNone(publication["recommendation"]["configurationId"])
        self.assertEqual(publication["recommendation"]["metrics"][0]["value"], "2")

    def test_reported_uncertainty_is_preserved_over_recomputed_interval(self):
        bundle = sample_bundle()
        bundle["benchmarkRuns"][0]["reportedUncertainty"] = 0.023
        first = normalize_bundle(bundle)["benchmarkRuns"][0]
        self.assertAlmostEqual(first["confidenceIntervalLow"], 0.577)
        self.assertAlmostEqual(first["confidenceIntervalHigh"], 0.623)


if __name__ == "__main__":
    unittest.main()
