import { CookedDishUpserter } from "../../../../../../src/contexts/dishes/cooked-dishes/application/upsert/CookedDishUpserter";
import { CookedDish } from "../../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDish";
import { CookedDishId } from "../../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDishId";
import { CookedDishRepository } from "../../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDishRepository";
import { CookedDishSearchCriteria } from "../../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDishSearchCriteria";
import { CookedDishRepositorySearchResult } from "../../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDishSearchResult";
import { DomainEvent } from "../../../../../../src/contexts/shared/domain/event/DomainEvent";
import { EventBus } from "../../../../../../src/contexts/shared/domain/event/EventBus";
import { MockTransactionManager } from "../../../../shared/infrastructure/MockTransactionManager";
import { CookedDishMother } from "../../domain/CookedDishMother";

class RecordingRepository extends CookedDishRepository {
	readonly saveMock = jest.fn();
	readonly updateMock = jest.fn();
	constructor(private readonly found: CookedDish | null) {
		super();
	}

	async save(dish: CookedDish): Promise<void> {
		this.saveMock(dish.toPrimitives());
	}

	async update(dish: CookedDish): Promise<void> {
		this.updateMock(dish.toPrimitives());
	}

	async searchById(_id: CookedDishId): Promise<CookedDish | null> {
		return this.found;
	}

	async searchAll(): Promise<CookedDish[]> {
		return [];
	}

	async search(
		_criteria: CookedDishSearchCriteria,
	): Promise<CookedDishRepositorySearchResult> {
		return { items: [], totalItems: 0 };
	}

	async searchByRecentSimilarIngredients(
		_names: string[],
	): Promise<CookedDish[]> {
		return [];
	}
}

class RecordingEventBus extends EventBus {
	readonly publishMock = jest.fn();
	async publish(events: DomainEvent[]): Promise<void> {
		this.publishMock(events);
	}
}

describe("CookedDishUpserter should", () => {
	it("create and publish a created event when the dish is absent", async () => {
		const repository = new RecordingRepository(null);
		const bus = new RecordingEventBus();
		const dish = CookedDishMother.create().toPrimitives();
		const result = await new CookedDishUpserter(
			repository,
			bus,
			new MockTransactionManager(),
		).upsert(
			dish.id,
			dish.name,
			dish.description,
			dish.ingredients,
			"chef",
		);

		expect(result).toBe("created");
		expect(repository.saveMock).toHaveBeenCalledWith(dish);
		expect(repository.updateMock).not.toHaveBeenCalled();
		expect(bus.publishMock).toHaveBeenCalledWith([
			expect.objectContaining({
				eventName: "dishes.cooked_dish.created",
				author: "chef",
			}),
		]);
	});

	it("update and publish only changed fields", async () => {
		const existing = CookedDishMother.create();
		const repository = new RecordingRepository(existing);
		const bus = new RecordingEventBus();
		const primitives = existing.toPrimitives();
		const result = await new CookedDishUpserter(
			repository,
			bus,
			new MockTransactionManager(),
		).upsert(
			primitives.id,
			"Renamed",
			primitives.description,
			primitives.ingredients,
			"editor",
		);

		expect(result).toBe("updated");
		expect(repository.updateMock).toHaveBeenCalledWith({
			...primitives,
			name: "Renamed",
		});
		expect(bus.publishMock).toHaveBeenCalledWith([
			expect.objectContaining({
				eventName: "dishes.cooked_dish.updated",
				author: "editor",
				fields: { name: { from: primitives.name, to: "Renamed" } },
			}),
		]);
	});

	it("perform no write or publication for an unchanged dish", async () => {
		const existing = CookedDishMother.create();
		const repository = new RecordingRepository(existing);
		const bus = new RecordingEventBus();
		const dish = existing.toPrimitives();
		const result = await new CookedDishUpserter(
			repository,
			bus,
			new MockTransactionManager(),
		).upsert(
			dish.id,
			dish.name,
			dish.description,
			dish.ingredients,
			"editor",
		);

		expect(result).toBe("unchanged");
		expect(repository.saveMock).not.toHaveBeenCalled();
		expect(repository.updateMock).not.toHaveBeenCalled();
		expect(bus.publishMock).not.toHaveBeenCalled();
	});
});
