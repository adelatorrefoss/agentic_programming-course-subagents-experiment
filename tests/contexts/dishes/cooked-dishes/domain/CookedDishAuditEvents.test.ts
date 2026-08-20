import { CookedDishCreatedDomainEvent } from "../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDishCreatedDomainEvent";
import { CookedDishUpdatedDomainEvent } from "../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDishUpdatedDomainEvent";
import { DomainEventJsonDeserializer } from "../../../../../src/contexts/shared/infrastructure/domain-event/DomainEventJsonDeserializer";
import { DomainEventJsonSerializer } from "../../../../../src/contexts/shared/infrastructure/domain-event/DomainEventJsonSerializer";

import { CookedDishMother } from "./CookedDishMother";

describe("CookedDish audit events", () => {
	it("record and round-trip a creation event", () => {
		const primitives = CookedDishMother.create().toPrimitives();
		const dish = CookedDishMother.create(primitives);
		const created = dish.update(
			primitives.name,
			primitives.description,
			primitives.ingredients,
			"actor",
		);

		expect(created.pullDomainEvents()).toEqual([]);

		const event = new CookedDishCreatedDomainEvent(primitives.id, "actor", {
			name: primitives.name,
			description: primitives.description,
			ingredients: primitives.ingredients,
		});
		const deserializer = new DomainEventJsonDeserializer(
			new Map([
				[
					CookedDishCreatedDomainEvent.eventName,
					CookedDishCreatedDomainEvent,
				],
			]),
		);

		expect(
			deserializer.deserialize(
				DomainEventJsonSerializer.serialize(event),
			),
		).toEqual(event);
	});

	it("records changed fields and skips an unchanged update", () => {
		const dish = CookedDishMother.create();
		const primitives = dish.toPrimitives();
		const updated = dish.update(
			"New name",
			primitives.description,
			primitives.ingredients,
			"actor",
		);
		const events = updated.pullDomainEvents();

		expect(events).toHaveLength(1);
		expect(events[0]).toBeInstanceOf(CookedDishUpdatedDomainEvent);
		expect(events[0].toPrimitives()).toEqual(
			expect.objectContaining({
				author: "actor",
				fields: { name: { from: primitives.name, to: "New name" } },
			}),
		);
		expect(
			updated
				.update(
					"New name",
					primitives.description,
					primitives.ingredients,
					"actor",
				)
				.pullDomainEvents(),
		).toEqual([]);
	});
});
