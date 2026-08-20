#!/usr/bin/env bash
set -euo pipefail

commit_sha="${REMOTE_CI_EXPECTED_SHA:-$(git rev-parse HEAD)}"
repository="${REMOTE_CI_REPOSITORY:-}"

if [[ -z "$repository" ]]; then
	remote_url="$(git remote get-url origin)"
	if [[ "$remote_url" =~ github\.com[:/]([^/]+/[^/]+)$ ]]; then
		repository="${BASH_REMATCH[1]%.git}"
	else
		echo "Unable to derive a GitHub repository from origin: $remote_url" >&2
		exit 1
	fi
fi

if [[ -n "${REMOTE_CI_RESPONSE_FILE:-}" ]]; then
	response="$(<"$REMOTE_CI_RESPONSE_FILE")"
else
	response="$(curl --fail --silent --show-error \
		-H 'Accept: application/vnd.github+json' \
		-H 'X-GitHub-Api-Version: 2022-11-28' \
		"https://api.github.com/repos/${repository}/actions/runs?head_sha=${commit_sha}&event=push&per_page=20")"
fi

printf '%s' "$response" | node -e '
const fs = require("node:fs");
const expectedSha = process.argv[1];
const payload = JSON.parse(fs.readFileSync(0, "utf8"));
const runs = Array.isArray(payload.workflow_runs) ? payload.workflow_runs : [];
const run = runs.find((candidate) => candidate.head_sha === expectedSha);

if (!run) {
	console.error(`No pushed GitHub Actions run found for ${expectedSha}.`);
	process.exit(1);
}

if (run.status !== "completed") {
	console.error(`GitHub Actions run is still ${run.status}: ${run.html_url}`);
	process.exit(1);
}

if (run.conclusion !== "success") {
	console.error(`GitHub Actions run concluded ${run.conclusion}: ${run.html_url}`);
	process.exit(1);
}

console.log(`Remote CI passed for ${expectedSha}: ${run.html_url}`);
' "$commit_sha"
