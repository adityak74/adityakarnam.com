#!/usr/bin/env bash
# Resume the suite with the context sweep capped at 65536.
#
# Why: at ctx=131072 a single prefill took 1,650 s (27.5 min) versus 117 s at
# 65536 — a 14x cost for a 2x context, far past the ~4x that O(n^2) attention
# predicts. At 8 reps that is ~3.7 h for one cell, ~11 h across the three KV
# arms, before any other cell. The full sweep would have run 15-20 h and would
# never have reached the 8-bit and 4-bit KV arms — and the ablation across those
# arms IS the experiment. Capping at 65536 trades one context point for the
# entire causal result.
#
# The kv=None arm is already complete for 512..65536 at 7 reps, so this only
# runs the two missing ablation arms. Existing rows are preserved; the harness
# appends.
set -uo pipefail
cd "$(dirname "$0")/../.."

HERE="scripts/benchmarks"
RESULTS="$HERE/results"
LOGS="$RESULTS/logs"
PY="${PY:-uv run --with mlx --with mlx-lm python3}"
MLX_MODEL="mlx-community/Qwen3-8B-4bit"
OLLAMA_MODEL="qwen3.6:27b"
CTX="512,1024,2048,4096,8192,16384,32768,65536"
LOG="$RESULTS/run_all.log"
mkdir -p "$LOGS"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }

run() {
  local name="$1"; shift
  log "starting $name"
  # shellcheck disable=SC2086
  $PY "$@" 2>&1 | tee -a "$LOGS/${name}-$(date +%Y%m%d-%H%M%S).log" >> "$LOG"
  log "$name exited rc=${PIPESTATUS[0]}"
}

echo "running_capped" > "$RESULTS/run_status.txt"
log "RESUME with context cap 65536. Rationale in this script's header."
log "swap now: $(sysctl -n vm.swapusage)"

# Missing KV ablation arms only — kv=None is already banked for these contexts.
run exp1 "$HERE/exp1_kv_cache_longcontext.py" --results-dir "$RESULTS" \
  --model "$MLX_MODEL" --contexts "$CTX" --kv-bits 8,4 --reps 7

run exp3 "$HERE/exp3_batch_concurrency.py" --results-dir "$RESULTS" \
  --engines mlx --mlx-model "$MLX_MODEL" --contexts 512,4096,16384,32768 --reps 5

run exp4 "$HERE/exp4_mlx_vs_ollama_longcontext.py" --results-dir "$RESULTS" \
  --mlx-model "$MLX_MODEL" --ollama-model "$OLLAMA_MODEL" \
  --contexts 512,4096,16384,32768,65536 --reps 5

log "capped suite finished"
log "swap at end: $(sysctl -n vm.swapusage)"
echo "completed" > "$RESULTS/run_status.txt"
