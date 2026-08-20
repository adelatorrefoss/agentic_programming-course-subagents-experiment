# Supuestos del contrato probado

- `weekStart` y `day` son fechas ISO `YYYY-MM-DD`; la semana comienza en lunes.
- La asignación, sustitución y retirada se persisten mediante operaciones atómicas del
  repositorio, cuya restricción única `(plan, día, slot)` es la autoridad ante concurrencia.
- La búsqueda de un plan inexistente devuelve `null`; las operaciones que necesitan el
  plan lanzan `WeeklyMealPlanNotFoundError`.
- La lista de la compra conserva el primer nombre y tipo encontrados y agrupa nombres sin
  distinguir mayúsculas/minúsculas.
