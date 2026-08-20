#!/usr/bin/env bash
set -euo pipefail

fixture_dir="$(mktemp -d)"
trap 'rm -rf "$fixture_dir"' EXIT
sha="1111111111111111111111111111111111111111"

verify_fixture() {
	REMOTE_CI_EXPECTED_SHA="$sha" \
		REMOTE_CI_REPOSITORY="owner/repository" \
		REMOTE_CI_RESPONSE_FILE="$1" \
		bash scripts/agent-harness/verify-remote-ci.sh
}

cat >"$fixture_dir/success.json" <<EOF
{"workflow_runs":[{"head_sha":"$sha","status":"completed","conclusion":"success","html_url":"https://github.com/owner/repository/actions/runs/1"}]}
EOF
verify_fixture "$fixture_dir/success.json" >/dev/null

for state in missing pending failed mismatched; do
	case "$state" in
		missing) payload='{"workflow_runs":[]}' ;;
		pending) payload="{\"workflow_runs\":[{\"head_sha\":\"$sha\",\"status\":\"in_progress\",\"conclusion\":null,\"html_url\":\"https://example.test/pending\"}]}" ;;
		failed) payload="{\"workflow_runs\":[{\"head_sha\":\"$sha\",\"status\":\"completed\",\"conclusion\":\"failure\",\"html_url\":\"https://example.test/failed\"}]}" ;;
		mismatched) payload='{"workflow_runs":[{"head_sha":"2222222222222222222222222222222222222222","status":"completed","conclusion":"success","html_url":"https://example.test/mismatch"}]}' ;;
	esac
	printf '%s\n' "$payload" >"$fixture_dir/$state.json"
	if verify_fixture "$fixture_dir/$state.json" >/dev/null 2>&1; then
		echo "Remote CI verifier accepted $state evidence." >&2
		exit 1
	fi
done

echo "Remote CI verification tests passed."
