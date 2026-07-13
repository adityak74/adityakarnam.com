import json
import sys
import tempfile
import unittest
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


class ValueLabPipelineTests(unittest.TestCase):
    def test_dashboard_cards_are_generated_from_publishable_runs(self):
        publication = build_publication(normalize_bundle(sample_bundle()))
        cards = {card["id"]: card for card in publication["dashboardCards"]}
        self.assertEqual(publication["schemaVersion"], 2)
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
