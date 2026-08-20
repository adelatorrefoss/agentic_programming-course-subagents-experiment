# Ejemplos de tareas funcionales

Este catálogo describe únicamente resultados observables del producto. La asignación
de agentes, la estrategia de pruebas y las validaciones de cierre pertenecen al
harness definido en `AGENTS.md`, `.agents/DELEGATION_TEMPLATE.md` y
`docs/agent-harness.md`.

## TASK-001. Valoraciones y puntuación de platos cocinados

### Alcance

- [x] Permitir valorar un plato con autor, puntuación de 1 a 5 y comentario.
- [x] Impedir más de una valoración del mismo autor para un mismo plato.
- [x] Mostrar media, total y distribución de puntuaciones en el detalle del plato.
- [x] Mostrar estados de carga, éxito y error al enviar una valoración.
- [x] Mostrar la nota media y el total de valoraciones en cada tarjeta de la página principal.
- [x] Mostrar un estado específico para los platos que todavía no tienen valoraciones.

## TASK-002. Planificador semanal de comidas y lista de la compra

### Alcance

- [x] Crear y consultar planes semanales.
- [x] Organizar desayuno, comida y cena para cada día de la semana.
- [x] Asignar, sustituir y retirar un plato de una franja.
- [x] Evitar que una franja tenga más de un plato asignado.
- [x] Navegar entre semanas desde el calendario.
- [x] Acceder al planificador mediante una acción visible desde la página principal.
- [x] Consolidar ingredientes repetidos en una lista de la compra.
- [x] Mostrar estados vacíos, de carga y de error en el plan y la lista de la compra.

## TASK-003. Búsqueda avanzada y paginada de platos

### Alcance

- [x] Buscar platos por texto libre.
- [x] Filtrar por tipos de ingrediente, puntuación mínima y rango de fechas.
- [x] Combinar varios filtros en una misma búsqueda.
- [x] Ordenar por las opciones admitidas por el producto.
- [x] Navegar por resultados paginados y consultar sus metadatos.
- [x] Informar de filtros inválidos con mensajes comprensibles.
- [x] Mostrar estados de carga, sin resultados y error.
- [x] Conservar en los resultados la información de valoraciones de cada plato.

## TASK-004. Historial auditable de cambios en platos

### Alcance

- [x] Registrar la creación y las modificaciones de un plato.
- [x] Guardar el tipo de cambio, los datos relevantes, el autor y la fecha.
- [x] Mantener las entradas del historial inmutables.
- [x] Consultar el historial completo desde el detalle del plato.
- [x] Ordenar los cambios cronológicamente y mostrar su detalle.
- [x] Mostrar estados de carga, historial vacío y error.

## TASK-006. Interfaz para actualizar platos

### Alcance

- [ ] Añadir una acción visible para editar un plato cocinado existente.
- [ ] Crear un formulario de edición precargado con los datos actuales del plato.
- [ ] Permitir actualizar el nombre, la descripción y los ingredientes del plato.
- [ ] Validar los campos antes de enviar los cambios.
- [ ] Guardar los cambios y mantener el plato sin modificar cuando se cancele la edición.
- [ ] Mostrar estados de carga, éxito y error durante la actualización.
- [ ] Reflejar los cambios guardados en la interfaz sin mostrar datos obsoletos.

## TASK-007. Favoritos personales

### Alcance

- [ ] Marcar y desmarcar un plato como favorito desde el listado y el detalle.
- [ ] Mostrar inmediatamente el estado actualizado de la acción.
- [ ] Consultar una vista que contenga únicamente los platos favoritos.
- [ ] Mantener los favoritos al recargar o volver a iniciar sesión.
- [ ] Mostrar un estado vacío con una acción para descubrir platos.
- [ ] Resolver de forma comprensible los errores al cambiar un favorito.

## TASK-008. Etiquetas y colecciones de platos

### Alcance

- [ ] Crear, renombrar y eliminar colecciones.
- [ ] Añadir y retirar platos de una colección.
- [ ] Asignar varias etiquetas a un plato.
- [ ] Filtrar platos por una o varias etiquetas.
- [ ] Consultar el contenido y el número de platos de cada colección.
- [ ] Evitar nombres de colección duplicados para una misma persona.

## TASK-009. Duplicar y adaptar un plato

### Alcance

- [ ] Ofrecer una acción de duplicado desde el detalle del plato.
- [ ] Precargar la copia con el nombre, descripción e ingredientes originales.
- [ ] Permitir editar todos los datos antes de guardar la variante.
- [ ] Identificar el plato del que procede cada variante.
- [ ] Navegar entre un plato original y sus variantes.
- [ ] Cancelar el proceso sin crear datos parciales.

## TASK-010. Escalado de cantidades por raciones

### Alcance

- [ ] Definir el número de raciones base de cada plato.
- [ ] Seleccionar el número de raciones deseado en el detalle.
- [ ] Recalcular todas las cantidades de forma proporcional.
- [ ] Mantener unidades y redondeos comprensibles para la persona usuaria.
- [ ] Restaurar fácilmente las cantidades originales.
- [ ] Usar las cantidades escaladas al añadir el plato a la lista de la compra.

## TASK-011. Control de alérgenos y preferencias alimentarias

### Alcance

- [ ] Configurar alérgenos y preferencias alimentarias personales.
- [ ] Identificar los alérgenos presentes en los ingredientes de cada plato.
- [ ] Mostrar advertencias visibles en listados y detalles.
- [ ] Filtrar platos compatibles con las preferencias seleccionadas.
- [ ] Explicar qué ingrediente provoca cada incompatibilidad.
- [ ] Solicitar confirmación antes de planificar un plato incompatible.

## TASK-012. Inventario de despensa

### Alcance

- [ ] Registrar ingredientes disponibles con cantidad, unidad y fecha de caducidad opcional.
- [ ] Actualizar o retirar existencias de la despensa.
- [ ] Mostrar ingredientes próximos a caducar.
- [ ] Comparar un plato con las existencias disponibles.
- [ ] Indicar qué ingredientes faltan y en qué cantidad.
- [ ] Descontar existencias al confirmar que se ha cocinado un plato.

## TASK-013. Sugerencias según la despensa

### Alcance

- [ ] Consultar platos ordenados por porcentaje de ingredientes disponibles.
- [ ] Priorizar ingredientes próximos a caducar.
- [ ] Mostrar qué ingredientes faltan para completar cada plato.
- [ ] Excluir platos incompatibles con las preferencias alimentarias.
- [ ] Ajustar las sugerencias al número de raciones deseado.
- [ ] Añadir los ingredientes faltantes a la lista de la compra.

## TASK-014. Importación de recetas

### Alcance

- [ ] Pegar el contenido de una receta para iniciar la importación.
- [ ] Extraer nombre, descripción, raciones e ingredientes cuando estén disponibles.
- [ ] Mostrar los campos detectados y los que requieren corrección.
- [ ] Editar el resultado antes de confirmar la creación.
- [ ] Detectar posibles duplicados por nombre e ingredientes.
- [ ] Cancelar la importación sin guardar información parcial.

## TASK-015. Compartir planes semanales

### Alcance

- [ ] Invitar a otra persona mediante un enlace con caducidad.
- [ ] Aceptar o rechazar una invitación.
- [ ] Consultar quién tiene acceso al plan.
- [ ] Diferenciar permisos de lectura y edición.
- [ ] Reflejar los cambios de colaboradores sin mostrar información obsoleta.
- [ ] Revocar el acceso de una persona o invalidar el enlace compartido.

## TASK-016. Modo de cocina paso a paso

### Alcance

- [ ] Definir y ordenar los pasos de preparación de un plato.
- [ ] Iniciar el modo de cocina desde el detalle.
- [ ] Avanzar y retroceder entre pasos sin perder el progreso.
- [ ] Mostrar en cada paso los ingredientes y cantidades relevantes.
- [ ] Incluir temporizadores opcionales asociados a un paso.
- [ ] Recuperar una sesión de cocina interrumpida.
- [ ] Confirmar la finalización y registrar cuándo se cocinó el plato.
