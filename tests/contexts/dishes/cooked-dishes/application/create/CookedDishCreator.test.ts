import { CookedDishCreator } from "../../../../../../src/contexts/dishes/cooked-dishes/application/create/CookedDishCreator";
import { CookedDish } from "../../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDish";
import { DomainEvent } from "../../../../../../src/contexts/shared/domain/event/DomainEvent";
import { EventBus } from "../../../../../../src/contexts/shared/domain/event/EventBus";
import { MockTransactionManager } from "../../../../shared/infrastructure/MockTransactionManager";
import { CookedDishMother } from "../../domain/CookedDishMother";
import { MockCookedDishRepository } from "../../infrastructure/MockCookedDishRepository";

class RecordingEventBus extends EventBus {
	readonly publishMock = jest.fn();

	async publish(events: DomainEvent[]): Promise<void> {
		this.publishMock(events);
	}
}

describe("CookedDishCreator should", () => {
	const repository = new MockCookedDishRepository();
	const eventBus = new RecordingEventBus();
	const creator = new CookedDishCreator(
		repository,
		eventBus,
		new MockTransactionManager(),
	);

	it("create a cooked dish", async () => {
		const primitives = CookedDishMother.create().toPrimitives();
		const expectedDish = CookedDish.create(
			primitives.id,
			primitives.name,
			primitives.description,
			primitives.ingredients,
			"actor",
		);

		repository.shouldSave(expectedDish);

		await creator.create(
			primitives.id,
			primitives.name,
			primitives.description,
			primitives.ingredients,
			"actor",
		);

		expect(eventBus.publishMock).toHaveBeenCalledWith([
			expect.objectContaining({
				eventName: "dishes.cooked_dish.created",
				aggregateId: primitives.id,
				author: "actor",
			}),
		]);
	});
});
