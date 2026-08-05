#!/usr/bin/env bash
# Measures suite stability by running it repeatedly with retries disabled.
#
# A suite that passes once proves very little. This is how the "20 consecutive
# green runs before handoff" claim on my Upwork listing gets measured — and how
# you would check it yourself.
#
#   npm run flake-check
#   ITERATIONS=50 PROJECT=firefox npm run flake-check

set -uo pipefail

ITERATIONS="${ITERATIONS:-20}"
PROJECT="${PROJECT:-chromium}"
LOG_DIR="flake-results"
mkdir -p "$LOG_DIR"

passed=0
failed=0
failed_runs=()
start=$(date +%s)

echo "Running the suite ${ITERATIONS}x on ${PROJECT} with retries disabled."
echo

for ((i = 1; i <= ITERATIONS; i++)); do
  log="${LOG_DIR}/run-${i}.log"
  printf "  run %2d/%d ... " "$i" "$ITERATIONS"

  if npx playwright test --project="$PROJECT" --retries=0 --reporter=line >"$log" 2>&1; then
    printf "pass\n"
    passed=$((passed + 1))
  else
    printf "FAIL  (see %s)\n" "$log"
    failed=$((failed + 1))
    failed_runs+=("$i")
  fi
done

elapsed=$(( $(date +%s) - start ))
rate=$(awk -v f="$failed" -v n="$ITERATIONS" 'BEGIN { printf "%.1f", (f / n) * 100 }')

echo
echo "─────────────────────────────────────────────"
echo "  iterations   ${ITERATIONS}"
echo "  passed       ${passed}"
echo "  failed       ${failed}"
echo "  flake rate   ${rate}%"
echo "  elapsed      ${elapsed}s"
echo "─────────────────────────────────────────────"

if (( failed > 0 )); then
  echo
  echo "Failed on runs: ${failed_runs[*]}"
  echo "Inspect the logs above before shipping this suite to anyone."
  exit 1
fi

echo
echo "${ITERATIONS}/${ITERATIONS} green. Suite is stable enough to hand over."
