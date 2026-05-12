#!/usr/bin/env bash
# Codex Stop hook. Runs the repository quality gate before a turn finishes.

set -u

INPUT=$(cat)
ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)

STOP_HOOK_ACTIVE=$(
  python3 - "$INPUT" <<'PY'
import json
import sys

try:
    payload = json.loads(sys.argv[1]) if sys.argv[1] else {}
except Exception:
    payload = {}

print("true" if payload.get("stop_hook_active") else "false")
PY
)

if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  exit 0
fi

OUTPUT=$("$ROOT/scripts/quality-gate.sh" 2>&1)
STATUS=$?

if [ "$STATUS" -eq 0 ]; then
  python3 - <<'PY'
import json

print(json.dumps({
    "continue": True,
    "systemMessage": "Quality gate passed: lint, test, build, backend API check, and Docker smoke test completed.",
}, ensure_ascii=False))
PY
  exit 0
fi

python3 - "$OUTPUT" <<'PY'
import json
import sys

output = sys.argv[1]
print(json.dumps({
    "decision": "block",
    "reason": "Quality gate failed. Fix the failures, then rerun the required checks.\n\n" + output[-6000:],
}, ensure_ascii=False))
PY

exit 0
