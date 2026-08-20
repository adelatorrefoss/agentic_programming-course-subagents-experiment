import { CookedDishAuditRecorder } from "../../../../../../src/contexts/dishes/cooked-dish-history/application/record/CookedDishAuditRecorder";
import { CookedDishAuditEntry } from "../../../../../../src/contexts/dishes/cooked-dish-history/domain/CookedDishAuditEntry";
import { CookedDishCreatedDomainEvent } from "../../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDishCreatedDomainEvent";
import { CookedDishUpdatedDomainEvent } from "../../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDishUpdatedDomainEvent";
import { MockCookedDishAuditRepository } from "../../infrastructure/MockCookedDishAuditRepository";

const snapshot = {
	name: "Soup",
	description: "Warm",
	ingredients: [{ name: "Water", type: "main" }],
};

describe("CookedDishAuditRecorder should", () => {
	it.each([
		new CookedDishCreatedDomainEvent(
			"00000000-0000-4000-8000-000000000001",
			"chef",
			snapshot,
			"00000000-0000-4000-8000-000000000101",
			new Date("2026-08-20T10:00:00.000Z"),
		),
		new CookedDishUpdatedDomainEvent(
			"00000000-0000-4000-8000-000000000001",
			"chef",
			snapshot,
			{ ...snapshot, name: "New soup" },
			{ name: { from: "Soup", to: "New soup" } },
			"00000000-0000-4000-8000-000000000102",
			new Date("2026-08-20T11:00:00.000Z"),
		),
	])("map and append %s", async (event) => {
		const repository = new MockCookedDishAuditRepository();
		const recorder = new CookedDishAuditRecorder(repository);
		const type =
			event instanceof CookedDishCreatedDomainEvent
				? "created"
				: "updated";
		const changes =
			event instanceof CookedDishCreatedDomainEvent
				? { current: event.current }
				: {
						previous: event.previous,
						current: event.current,
						fields: event.fields,
					};
		repository.shouldAppend(
			new CookedDishAuditEntry(
				event.eventId,
				type,
				{ type: "cooked_dish", id: event.aggregateId },
				event.author,
				event.occurredAt,
				changes,
			),
		);

		await recorder.on(event);
		expect(recorder.subscribedTo()).toEqual([
			CookedDishCreatedDomainEvent,
			CookedDishUpdatedDomainEvent,
		]);
	});

	it("propagate audit persistence errors", async () => {
		const repository = new MockCookedDishAuditRepository();
		const recorder = new CookedDishAuditRecorder(repository);
		const event = new CookedDishCreatedDomainEvent("id", "chef", snapshot);
		const failure = new Error("audit unavailable");
		repository.shouldAppend(
			new CookedDishAuditEntry(
				event.eventId,
				"created",
				{ type: "cooked_dish", id: "id" },
				"chef",
				event.occurredAt,
				{ current: snapshot },
			),
		);
		repository.shouldAppendFail(failure);

		await expect(recorder.on(event)).rejects.toBe(failure);
	});
});
