#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
validator="${script_dir}/validate-functional-task-catalog.sh"
fixture_dir="$(mktemp -d)"
trap 'rm -rf "$fixture_dir"' EXIT

write_fixture() {
	local name="$1"
	local content="$2"
	printf '%s\n' "$content" >"${fixture_dir}/${name}.md"
}

expect_pass() {
	local name="$1"
	if ! bash "$validator" "${fixture_dir}/${name}.md" >/dev/null; then
		echo "Expected functional catalog fixture to pass: ${name}" >&2
		exit 1
	fi
}

expect_fail() {
	local name="$1"
	if bash "$validator" "${fixture_dir}/${name}.md" >/dev/null 2>&1; then
		echo "Expected harness-only catalog fixture to fail: ${name}" >&2
		exit 1
	fi
}

write_fixture functional '# Tareas
## TASK-101. Edición
### Alcance
- [ ] Mostrar estados de carga, éxito y error.
- [ ] Validar los campos antes de guardar.
- [ ] Reflejar los cambios sin datos obsoletos.'
expect_pass functional

write_fixture prompt '# Tareas
## TASK-101. Edición
### Prompt de ejemplo
> Implementa la tarea.
### Alcance
- [ ] Guardar los cambios.'
expect_fail prompt

for entry in \
	'role|- [ ] Delegar la interfaz en `frontend-engineer`.' \
	'test|- [ ] Añadir pruebas frontend del formulario.' \
	'architecture|- [ ] Registrar el caso de uso en DIOD.' \
	'command|- [ ] Verificar con `npm run prep`.' \
	'gate|- [ ] Invocar `harness-retro` al terminar.'; do
	name="${entry%%|*}"
	item="${entry#*|}"
	write_fixture "$name" "# Tareas
## TASK-101. Edición
### Alcance
${item}"
	expect_fail "$name"
done

echo "Functional task catalog regression tests passed."
