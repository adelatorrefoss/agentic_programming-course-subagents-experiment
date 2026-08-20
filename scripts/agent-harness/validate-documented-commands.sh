#!/usr/bin/env bash
set -euo pipefail

mapfile -t markdown_files < <(git ls-files -- '*.md')

if [[ "${#markdown_files[@]}" -eq 0 ]]; then
	echo "No Markdown documentation found." >&2
	exit 1
fi

failure_count=0

if grep -nHE 'npm[[:space:]]+(prep|test|build|lint|dev|start)([[:space:]]|`|$)' "${markdown_files[@]}"; then
	echo "Documented npm scripts must use the executable form 'npm run <script>'." >&2
	failure_count=$((failure_count + 1))
fi

mapfile -t documented_scripts < <(
	grep -hEo 'npm run [[:alnum:]:_-]+' "${markdown_files[@]}" |
		awk '{ print $3 }' |
		sort -u
)

for script_name in "${documented_scripts[@]}"; do
	if ! node -e '
		const scripts = require("./package.json").scripts ?? {};
		process.exit(Object.hasOwn(scripts, process.argv[1]) ? 0 : 1);
	' "$script_name"; then
		echo "Documented npm script is missing from package.json: ${script_name}" >&2
		failure_count=$((failure_count + 1))
	fi
done

if [[ "$failure_count" -gt 0 ]]; then
	echo "Documented command validation failed: ${failure_count} issue(s)." >&2
	exit 1
fi

echo "Documented npm commands valid: ${#documented_scripts[@]} script(s)."
