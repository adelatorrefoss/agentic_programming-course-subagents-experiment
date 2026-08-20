# 🎯 Revisión de código obligatoria antes del cierre de una tarea

## 💡 Convention

Toda tarea que modifique el repositorio debe pasar por el agente específico
`code-review` después del commit de implementación y antes de la validación
final y del cierre del harness.

El registro de coordinación debe incluir el agente que revisó, el rango de
commits revisado, el veredicto (`APPROVED` o `CHANGES_REQUESTED`) y la evidencia
de la revisión. Si hay hallazgos aceptados, deben resolverse en un commit
`fix(TASK-XXX): ...` y someterse a una nueva revisión hasta obtener `APPROVED`.

`npm run agents:validate` bloquea el cierre si falta cualquiera de estas
evidencias o si se usan valores como `not requested`, `pending` o `n/a`.

## 🏆 Benefits

- Evita cerrar tareas que solo han pasado lint y tests, pero no una revisión.
- Separa claramente autoría, revisión y remediación.
- Mantiene trazabilidad entre implementación, hallazgos y aprobación final.
- Convierte el workflow acordado en una condición verificable del harness.

## 👀 Examples

### ✅ Good: revisión aprobada y registrada

```markdown
- Code-review agent: `code-review`
- PR code review commit range: `abc1234^..abc1234`
- Code-review verdict: `APPROVED`
- Code-review evidence: no significant findings; output recorded in the task session
- Remediation required: no
- Remediation commit: none (no findings)
```

### ❌ Bad: revisión omitida

```markdown
- Code-review agent: not requested
- PR code review commit range: not requested
- Code-review verdict: not requested
```

Este registro debe ser rechazado aunque build y tests hayan pasado.

## 🧐 Real world examples

- [Plantilla de delegación](../../.agents/DELEGATION_TEMPLATE.md)
- [Validador de cierre](../../scripts/agent-harness/validate-task-closeout.sh)
- [Definición del agente](../../.agents/agents/code-review.agent.md)

## 🔗 Related agreements

- [Configuración del agent harness](../agent-harness.md)
- [Registros de coordinación](../../.agents/coordination/README.md)
- [Instrucciones raíz para agentes](../../AGENTS.md)
