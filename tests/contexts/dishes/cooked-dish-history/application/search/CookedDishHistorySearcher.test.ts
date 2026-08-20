import { CookedDishHistorySearcher } from "../../../../../../src/contexts/dishes/cooked-dish-history/application/search/CookedDishHistorySearcher";
import { CookedDishAuditEntry } from "../../../../../../src/contexts/dishes/cooked-dish-history/domain/CookedDishAuditEntry";
import { CookedDishNotFoundError } from "../../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDishNotFoundError";
import { CookedDishMother } from "../../../cooked-dishes/domain/CookedDishMother";
import { MockCookedDishRepository } from "../../../cooked-dishes/infrastructure/MockCookedDishRepository";
import { MockCookedDishAuditRepository } from "../../infrastructure/MockCookedDishAuditRepository";

describe("CookedDishHistorySearcher should", () => {
	it("project audit persistence into the public history contract", async () => {
		const dishes = new MockCookedDishRepository();
		const audits = new MockCookedDishAuditRepository();
		const dish = CookedDishMother.create();
		const entry = CookedDishAuditEntry.fromPrimitives({
			id: "event",
			type: "created",
			entity: { type: "cooked_dish", id: dish.id.value },
			author: "chef",
			occurredAt: "2026-08-20T10:00:00.000Z",
			changes: {
				current: {
					name: dish.name,
					description: dish.description,
					ingredients: dish.toPrimitives().ingredients,
				},
			},
		});
		dishes.shouldSearchByIdReturn(dish);
		audits.shouldSearchByDishIdReturn([entry]);

		await expect(
			new CookedDishHistorySearcher(dishes, audits).search(dish.id.value),
		).resolves.toEqual([
			{
				id: "event",
				type: "cooked_dish.created",
				entity: { type: "cooked_dish", id: dish.id.value },
				author: "chef",
				occurredAt: "2026-08-20T10:00:00.000Z",
				changes: [
					{ field: "name", before: null, after: dish.name },
					{
						field: "description",
						before: null,
						after: dish.description,
					},
					{
						field: "ingredients",
						before: null,
						after: dish.toPrimitives().ingredients,
					},
				],
			},
		]);
	});

	it("reject a missing dish without reading audits", async () => {
		const dishes = new MockCookedDishRepository();
		const audits = new MockCookedDishAuditRepository();
		dishes.shouldSearchByIdReturn(null);

		await expect(
			new CookedDishHistorySearcher(dishes, audits).search(
				"00000000-0000-4000-8000-000000000001",
			),
		).rejects.toBeInstanceOf(CookedDishNotFoundError);
	});
});
