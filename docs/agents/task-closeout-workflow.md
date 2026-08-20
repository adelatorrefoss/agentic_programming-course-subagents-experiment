# 🎯 Cierre completo de tareas y handoff HIL

## 💡 Convention

Toda tarea que modifique el repositorio debe terminar con un cierre trazable que
deje la funcionalidad, la revisión, el agent harness y el árbol de trabajo listos
para comenzar la siguiente tarea.

El cierre se ejecuta en este orden:

Durante todo el workflow, cada commit de la tarea debe incluir la versión
actualizada de su archivo `.agents/coordination/` junto con los archivos que
originan esa actualización. El registro debe describir el estado alcanzado por
ese mismo commit (artefactos, verificaciones, revisión o retro); no se permite
acumular toda la trazabilidad en un commit final ni crear un commit separado
solo para el avance de coordinación cuando existen artefactos asociados.

1. Completar la implementación y vincular cada criterio de aceptación o TODO
   marcado con su artefacto y una verificación aprobada en el registro de
   coordinación.
2. Ejecutar `npm run prep` y corregir cualquier fallo.
3. Actualizar el registro de coordinación y crear el commit de implementación
   `feat(TASK-XXX): ...`, incluyendo ambos cambios.
4. Invocar `code-review` con el rango exacto de commits, persistir su informe en
   `.agents/reviews/` y repetir el ciclo `fix(TASK-XXX): ...` hasta obtener
   `APPROVED`.
5. Ejecutar de nuevo `npm run prep` después de cualquier remediación.
6. Invocar `harness-retro` y registrar todas sus recomendaciones con IDs
   estables en `TODO-AGENT-HARNESS.md`.
7. Crear un commit exclusivo para el resultado del retro:
   `chore(TASK-XXX): record harness retro`.
8. Implementar todos los TODOs de harness aplicables antes de cerrar. Un TODO
   que no sea aplicable debe quedar justificado de forma explícita en el
   registro de coordinación; no puede quedar simplemente pendiente.
9. Verificar las mejoras del harness y crear un segundo commit independiente:
   `chore(TASK-XXX): implement harness retro todos`.
10. Completar el registro de coordinación con los commits, verificaciones,
    informe del retro y sign-off final; como en cada commit anterior, incluir
    esa actualización en el commit correspondiente.
11. Ejecutar `npm run prep`, `npm run agents:validate` y comprobar que
    `git status --short` no contiene cambios de la tarea sin registrar.
12. Seguir el flujo trunk-based: no publicar la rama de tarea ni ejecutar CI
    remoto para ella; las feature branches son solo locales. Integrarla en
    `main` intentando primero actualizar `main`, hacer `git rebase main` y
    después `git merge --no-ff`. Si el rebase se complica, abortarlo y hacer
    `git merge --no-ff` directamente en `main`, resolviendo allí los conflictos.
    Después publicar `main` y ejecutar `npm run task:verify-remote-ci` hasta que
    confirme que el run de GitHub Actions del `HEAD` de `main` terminó
    correctamente. No cerrar la tarea si CI falla o sigue en curso. Registrar la
    URL y el resultado en el handoff HIL, sin crear un commit posterior de
    evidencia (ese nuevo commit necesitaría su propio run).
13. Mostrar al usuario un resumen visual HIL (human in the loop) con la
    funcionalidad entregada, verificaciones, resultado de revisión, cambios del
    harness, commits, CI remoto, advertencias relevantes y estado de preparación
    para la siguiente tarea.

El resumen HIL es una puerta de visibilidad, no una sustitución de las
evidencias persistidas. Si queda una advertencia, un bloqueo o trabajo fuera de
alcance, debe aparecer claramente en el resumen final.

## Lenguaje visual de fases y agentes

Todas las actualizaciones visibles durante el workflow y el resumen HIL final
usan un icono estable para que el usuario identifique la fase de un vistazo:

| Icono | Fase / agente |
| --- | --- |
| 🗄️ | `database-engineer` / persistencia |
| ⚙️ | `backend-engineer` / dominio, aplicación y API |
| 🎨 | `frontend-engineer` / interfaz |
| 🧪 | `testing-engineer` / verificación |
| 🔍 | `code-review` / revisión independiente |
| 🧰 | `harness-retro` / mejoras del harness |
| ✅ | cierre y handoff HIL |

El icono acompaña al texto; nunca sustituye el estado, el resultado ni la
evidencia escrita.

Los hilos de agentes nuevos se nombran con la tarea y el rol vigentes (por
ejemplo, `task003_code_review`). Si el límite de concurrencia obliga a reutilizar
un hilo persistente con nombre histórico, este actúa solo como coordinador y
crea un worker anidado correctamente nombrado; las actualizaciones visibles
muestran el nombre actual, no el identificador legado.

## 🏆 Benefits

- Evita que una tarea aparentemente terminada deje deuda del harness pendiente.
- Separa la implementación funcional, el resultado del retro y sus mejoras en
  commits auditables.
- Permite que una persona compruebe de un vistazo qué se entregó y qué debe
  tener en cuenta.
- Garantiza que la siguiente tarea comienza con validaciones aprobadas,
  evidencias completas y un árbol de trabajo limpio.

## 👀 Examples

### ✅ Good: cierre completo y resumen HIL visible

```text
┌─ TASK-002 · CIERRE ────────────────────────────────┐
│ Funcionalidad   Plan semanal y lista de compra   ✅ │
│ Verificación    npm run prep                     ✅ │
│ Code review     APPROVED                         ✅ │
│ Harness retro   2 TODOs registrados              ✅ │
│ Harness TODOs   2 implementados y verificados    ✅ │
│ Coordination    Evidencias completas             ✅ │
│ Remote CI       GitHub Actions                   ✅ │
│ Worktree        Limpio                           ✅ │
└─ Siguiente tarea: lista para comenzar ─────────────┘

Commits:
- feat(TASK-002): complete weekly meal planning
- chore(TASK-002): record harness retro
- chore(TASK-002): implement harness retro todos

A tener en cuenta: ninguna advertencia abierta.
```

### ❌ Bad: cerrar con el retro o sus acciones pendientes

```text
Code review: APPROVED
Harness retro: ejecutado
TODOs: pendientes para más adelante
Worktree: contiene cambios sin commit
TASK-002 terminada
```

Este cierre no es válido: faltan la implementación o justificación de los TODOs,
sus verificaciones, los commits correspondientes y un estado limpio.

## 🧐 Real world examples

- [Registro de TODOs del agent harness](../../TODO-AGENT-HARNESS.md)
- [Plantilla del registro de coordinación](../../.agents/DELEGATION_TEMPLATE.md)
- [Definición del agente harness-retro](../../.agents/agents/harness-retro.agent.md)
- [Validador del cierre](../../scripts/agent-harness/validate-task-closeout.sh)

## 🔗 Related agreements

- [Revisión de código obligatoria](task-code-review-workflow.md)
- [Configuración del agent harness](../agent-harness.md)
- [Estándar de documentación](../documentation-guidelines.md)
- [Instrucciones raíz para agentes](../../AGENTS.md)
