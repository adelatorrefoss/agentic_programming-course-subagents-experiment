#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

cd "$PROJECT_DIR"

echo "Validating agent configuration and tool permissions..."
npm run agents:validate

echo "Checking required task services..."
npm run harness:check

echo "Task preflight passed."
