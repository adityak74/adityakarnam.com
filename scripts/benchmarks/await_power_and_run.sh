#!/usr/bin/env bash
# Wait for AC power, then run the full benchmark suite with sleep inhibited.
#
# Apple Silicon throttles sustained GPU/memory work on battery, so starting on
# battery would produce numbers that are not comparable to published figures or
# to earlier posts on this site. This waits instead of wasting the run.
#
# Usage: ./scripts/benchmarks/await_power_and_run.sh [--reduced]
set -uo pipefail

cd "$(dirname "$0")/../.."
LOG_DIR="scripts/benchmarks/results"
mkdir -p "$LOG_DIR"
LOG="$LOG_DIR/run_all.log"
STATUS="$LOG_DIR/run_status.txt"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }

on_ac() { pmset -g batt | grep -q "AC Power"; }

echo "waiting_for_power" > "$STATUS"
log "Waiting for AC power before starting. Current: $(pmset -g batt | head -1)"

WAITED=0
until on_ac; do
  sleep 30
  WAITED=$((WAITED + 30))
  if [ $((WAITED % 900)) -eq 0 ]; then
    log "Still on battery after $((WAITED / 60)) min. $(pmset -g batt | sed -n 2p)"
  fi
  # Give up after 8 hours rather than linger forever.
  if [ "$WAITED" -ge 28800 ]; then
    log "ABORT: no AC power after 8 hours. Nothing was run."
    echo "aborted_no_power" > "$STATUS"
    exit 1
  fi
done

log "AC power detected. Starting full suite."
log "Battery: $(pmset -g batt | sed -n 2p)"
log "Swap at start: $(sysctl -n vm.swapusage)"
echo "running" > "$STATUS"

# caffeinate: -i no idle sleep, -m no disk sleep, -s no system sleep while on AC.
caffeinate -ims ./scripts/benchmarks/run_all.sh "$@" >>"$LOG" 2>&1
RC=$?

log "run_all.sh exited with code $RC"
log "Swap at end: $(sysctl -n vm.swapusage)"
if [ "$RC" -eq 0 ]; then echo "completed" > "$STATUS"; else echo "failed_rc_$RC" > "$STATUS"; fi

log "Result files:"
ls -la "$LOG_DIR" | grep -v DRYRUN | tee -a "$LOG"
exit $RC
