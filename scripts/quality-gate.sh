#!/usr/bin/env bash
# Shared quality gate for Codex Stop hooks and Git pre-push hooks.

set -u

npm run lint || exit 1
npm run test --if-present || exit 1
npm run build || exit 1

read_env_value() {
  local key="$1"
  local file="${2:-.env}"

  if [ ! -f "$file" ]; then
    return 0
  fi

  awk -F '=' -v key="$key" '
    $1 == key {
      value = substr($0, length(key) + 2)
      gsub(/^["'\'']|["'\'']$/, "", value)
      print value
      exit
    }
  ' "$file"
}

BACKEND_URL="${BACKEND_API_HEALTH_URL:-}"
if [ -z "$BACKEND_URL" ]; then
  BACKEND_URL=$(read_env_value BACKEND_API_HEALTH_URL .env)
fi
if [ -z "$BACKEND_URL" ]; then
  BACKEND_URL="${VITE_API_BASE_URL:-}"
fi
if [ -z "$BACKEND_URL" ]; then
  BACKEND_URL=$(read_env_value VITE_API_BASE_URL .env)
fi
if [ -z "$BACKEND_URL" ]; then
  BACKEND_URL=$(read_env_value VITE_API_BASE_URL .env.example)
fi

if [ -n "$BACKEND_URL" ]; then
  BACKEND_API_TEST_URL="$BACKEND_URL" node -e "
const url = process.env.BACKEND_API_TEST_URL;
const deadline = Date.now() + 15000;

async function check() {
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.status < 500) {
        console.error('Backend API connectivity check passed: ' + url + ' -> HTTP ' + res.status);
        process.exit(0);
      }
      console.error('Backend API returned HTTP ' + res.status + ' at ' + url);
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      continue;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.error('Backend API connectivity check failed: cannot reach ' + url);
  console.error('Set BACKEND_API_HEALTH_URL for a specific health endpoint, or update VITE_API_BASE_URL.');
  process.exit(1);
}

check();
" || exit 1
else
  echo "No backend API URL configured; skipping backend API connectivity check." >&2
fi

if command -v docker >/dev/null 2>&1; then
  if ! docker info >/dev/null 2>&1; then
    echo "Docker is installed but the daemon is not reachable; skipping Docker smoke test." >&2
    exit 0
  fi

  cleanup_docker_smoke() {
    docker compose down >/dev/null 2>&1 || true
  }
  trap cleanup_docker_smoke EXIT

  docker compose up -d --build app || exit 1
  docker compose exec -T app node -e "
const url = 'http://127.0.0.1:4173';
const deadline = Date.now() + 30000;

async function check() {
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) process.exit(0);
      console.error('Docker smoke test received HTTP ' + res.status);
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      continue;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.error('Docker smoke test failed: preview server did not become ready at ' + url);
  process.exit(1);
}

check();
" || exit 1
else
  echo "docker is not installed or not on PATH; skipping Docker smoke test." >&2
fi

exit 0
