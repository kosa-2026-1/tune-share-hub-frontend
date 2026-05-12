#!/usr/bin/env bash
# Install team git hooks into .git/hooks.

set -eu

ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
HOOK_SRC="$ROOT/scripts/git-hooks"
HOOK_DST="$ROOT/.git/hooks"

if [ ! -d "$HOOK_DST" ]; then
  echo ".git/hooks not found. Run this inside a git repository." >&2
  exit 1
fi

for hook in commit-msg pre-push; do
  cp "$HOOK_SRC/$hook" "$HOOK_DST/$hook"
  chmod +x "$HOOK_DST/$hook"
  echo "installed $hook"
done

echo "Codex TDD guard is configured by .codex/hooks.json and .codex/hooks/tdd-guard.sh."
