# Ejemplos de tareas multiagente

Estas tareas están diseñadas para practicar la coordinación entre los cuatro agentes del proyecto:

- `database-engineer`: esquema PostgreSQL, migraciones, índices y consultas.
- `backend-engineer`: dominio, casos de uso, repositorios, inyección de dependencias y API.
- `frontend-engineer`: páginas, componentes React, estado de UI e integración con la API.
- `testing-engineer`: tests unitarios y de integración, Object Mothers y Mock Objects.

## TASK-001. Valoraciones y puntuación de platos cocinados

### Prompt de ejemplo

> Implementa valoraciones de platos cocinados. Delega el diseño de la persistencia en
> `database-engineer`, el dominio, los casos de uso y las rutas API en `backend-engineer`,
> la interfaz de valoración en `frontend-engineer` y toda la estrategia de pruebas en
> `testing-engineer`. Coordina el trabajo, revisa la integración entre las partes y
> ejecuta `npm run prep` al terminar.

### Alcance

- [x] Crear una tabla de valoraciones asociada a `cooked_dishes`.
- [x] Guardar autor, puntuación de 1 a 5, comentario y fecha de creación.
- [x] Impedir más de una valoración del mismo autor para un mismo plato.
- [x] Modelar la valoración y sus invariantes en el dominio.
- [x] Crear un caso de uso para añadir una valoración.
- [x] Crear un caso de uso para obtener el resumen de valoraciones de un plato.
- [x] Exponer `POST /api/cooked-dishes/:uuid/ratings`.
- [x] Exponer `GET /api/cooked-dishes/:uuid/ratings` con media, total y distribución.
- [x] Registrar repositorios y casos de uso en DIOD.
- [x] Añadir tests unitarios del dominio y los casos de uso.
- [x] Añadir tests de integración del repositorio PostgreSQL.
- [x] Cubrir errores: plato inexistente, puntuación inválida y valoración duplicada.
- [x] Mostrar el resumen, la media y la distribución de valoraciones en la interfaz.
- [x] Permitir enviar una valoración desde la interfaz con puntuación y comentario.
- [x] Mostrar estados de carga, éxito y error al gestionar valoraciones.
- [x] Mostrar la nota media y el total de valoraciones en cada tarjeta de plato
  cocinado de la página principal, sin tener que entrar en el detalle, incluyendo
  el estado de platos que todavía no tienen valoraciones.
- [x] Verificar lint, build y tests con `npm run prep`.

### Reparto recomendado

- `database-engineer`: tablas, restricciones, claves foráneas e índices.
- `backend-engineer`: agregado, repositorio, casos de uso, DIOD y rutas API finas.
- `frontend-engineer`: componentes de valoración, estado de UI e integración con las rutas.
- `testing-engineer`: Mothers, mocks, tests unitarios e integración PostgreSQL.

## TASK-002. Planificador semanal de comidas y lista de la compra

### Prompt de ejemplo

> Añade un planificador semanal de comidas que permita asignar platos cocinados a días
> y genere una lista de la compra consolidada. Usa en paralelo `database-engineer`,
> `backend-engineer`, `frontend-engineer` y `testing-engineer`. Haz que cada agente sea
> responsable de su especialidad y entrega el cambio integrado y validado con `npm run prep`.

### Alcance

- [x] Diseñar la persistencia de planes semanales y sus comidas.
- [x] Garantizar que un día y franja (`breakfast`, `lunch`, `dinner`) tengan como máximo un plato.
- [x] Modelar `WeeklyMealPlan`, sus identificadores y reglas de negocio.
- [x] Crear casos de uso para crear un plan y asignar, sustituir o retirar un plato.
- [x] Crear un caso de uso que agrupe ingredientes repetidos en una lista de la compra.
- [x] Exponer rutas API para crear, consultar y modificar el plan.
- [x] Resolver todas las dependencias mediante DIOD.
- [x] Añadir tests de reglas, casos de uso, errores y persistencia.
- [x] Comprobar concurrencia al asignar dos platos a la misma franja.
- [x] Verificar que las rutas solo coordinan entrada, caso de uso y respuesta HTTP.
- [x] Crear una vista semanal para consultar y gestionar las comidas planificadas.
- [x] Hacer que la vista semanal sea accesible mediante un enlace o acción visible
  desde la página principal.
- [x] Permitir asignar, sustituir y retirar platos desde la interfaz.
- [x] Mostrar la lista de la compra consolidada con sus estados de carga y error.
- [x] Añadir pruebas frontend del calendario, sus interacciones y los estados de carga y error.
- [x] Verificar lint, build y tests con `npm run prep` después de completar el frontend.

> Estado final: `/meal-plans` ofrece el calendario semanal, las operaciones de
> asignar, sustituir y retirar, y la lista de compra; la home enlaza de forma
> visible al planificador.

### Reparto recomendado

- `database-engineer`: esquema relacional, restricciones de unicidad, índices y migraciones.
- `backend-engineer`: nuevo agregado, servicios de aplicación, repositorios y endpoints.
- `frontend-engineer`: calendario semanal, interacción de comidas y lista de la compra.
- `testing-engineer`: escenarios del agregado, mocks, Mothers y pruebas de integración.

## TASK-003. Búsqueda avanzada y paginada de platos

### Prompt de ejemplo

> Implementa una búsqueda avanzada de platos cocinados por texto, tipos de ingrediente,
> puntuación mínima y rango de fechas, con ordenación y paginación. Delega el SQL y sus
> índices en `database-engineer`, la arquitectura y API en `backend-engineer`, la interfaz
> de búsqueda en `frontend-engineer` y los tests en `testing-engineer`. Pide a los agentes
> que revisen los contratos compartidos antes de integrar y ejecuta `npm run prep`.

### Alcance

- [x] Definir un objeto de criterios de búsqueda independiente de PostgreSQL.
- [x] Añadir filtros combinables, ordenación permitida y paginación con límites seguros.
- [x] Diseñar los índices necesarios y justificar cada uno.
- [x] Implementar la consulta en `PostgresCookedDishRepository` con parámetros seguros.
- [x] Crear el caso de uso de búsqueda sin lógica de negocio en la ruta.
- [x] Exponer `GET /api/cooked-dishes` con los nuevos parámetros.
- [x] Devolver resultados y metadatos de paginación.
- [x] Validar parámetros y responder de forma consistente ante valores inválidos.
- [x] Crear controles de filtros, ordenación y paginación en la interfaz.
- [x] Mostrar resultados, metadatos y estados de carga o error de la búsqueda.
- [x] Probar filtros aislados, combinaciones, ordenación y límites de página.
- [x] Añadir tests de integración que detecten errores en el SQL real.
- [x] Verificar lint, build y tests con `npm run prep`.

### Reparto recomendado

- `database-engineer`: estrategia SQL, índices y revisión del plan de consulta.
- `backend-engineer`: criterios de dominio/aplicación, repositorio, caso de uso y API.
- `frontend-engineer`: filtros, resultados paginados y estados de la interfaz.
- `testing-engineer`: matriz de casos, datos de prueba y tests unitarios/de integración.

## TASK-004. Historial auditable de cambios en platos

### Prompt de ejemplo

> Implementa un historial auditable para la creación y modificación de platos cocinados.
> Coordina a `database-engineer` para la persistencia, `backend-engineer` para los eventos,
> suscriptores, caso de uso y API, `frontend-engineer` para la interfaz de consulta, y
> `testing-engineer` para las pruebas de todo el flujo. Evita acoplar el dominio a
> PostgreSQL y valida el resultado completo con `npm run prep`.

### Alcance

- [ ] Crear la persistencia inmutable de eventos de auditoría.
- [ ] Registrar tipo de cambio, entidad, datos relevantes, autor y fecha.
- [ ] Publicar eventos de dominio al crear o modificar un plato.
- [ ] Implementar un suscriptor que transforme esos eventos en entradas de auditoría.
- [ ] Mantener las rutas API y el agregado libres de detalles de infraestructura.
- [ ] Crear un caso de uso para consultar el historial de un plato.
- [ ] Exponer `GET /api/cooked-dishes/:uuid/history`.
- [ ] Registrar el suscriptor y sus dependencias en DIOD.
- [ ] Crear una vista de historial con cambios ordenados cronológicamente.
- [ ] Mostrar los detalles de cada cambio y sus estados de carga o error.
- [ ] Probar serialización, publicación, suscripción y persistencia.
- [ ] Verificar que un fallo de auditoría tenga el comportamiento transaccional acordado.
- [ ] Verificar lint, build y tests con `npm run prep`.

### Reparto recomendado

- `database-engineer`: modelo append-only, índices y política de integridad.
- `backend-engineer`: eventos, suscriptor, repositorio de auditoría, caso de uso y API.
- `frontend-engineer`: vista cronológica, detalle de cambios e integración con la API.
- `testing-engineer`: mocks del bus, pruebas de eventos, suscriptores e integración.

## Criterios comunes de coordinación

- [ ] Antes de programar, acordar contratos entre dominio, repositorios y esquema SQL.
- [ ] Permitir trabajo paralelo solo cuando esos contratos estén definidos.
- [ ] No colocar reglas de negocio en rutas API ni implementaciones PostgreSQL.
- [ ] Añadir `import "reflect-metadata"` como primer import de cada nueva ruta API.
- [ ] Decorar los servicios inyectables con `@Service()` y registrarlos en DIOD.
- [ ] Mantener las convenciones existentes para Mothers y mocks.
- [ ] Hacer que el agente principal revise el diff integrado, no solo los resultados aislados.
- [ ] Considerar terminada una tarea únicamente cuando `npm run prep` pase correctamente.
- [ ] Invocar `harness-retro` tras finalizar cada tarea para generar retros y propuestas de parche de configuración (NO aplicar cambios en código de producción).
