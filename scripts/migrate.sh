#!/usr/bin/env bash
set -Eeuo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
MODE="${1:-dev}"
exec "$SCRIPT_DIR/bugboard.sh" "$MODE" migrate
