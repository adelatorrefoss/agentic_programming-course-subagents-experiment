import {
	loadCookedDishCatalog,
	loadMealPlan,
	loadOrCreateMealPlan,
	loadShoppingList,
	parseCookedDishCatalog,
	removeMeal,
	saveMeal,
} from "../../../src/app/meal-plans/meal-plan-api";

const fetchMock = jest.fn();

function response(status: number, payload?: unknown): Response {
	return {
		ok: status >= 200 && status < 300,
		status,
		json: jest.fn().mockResolvedValue(payload),
	} as unknown as Response;
}

describe("meal-plan API adapter should", () => {
	beforeAll(() => {
		global.fetch = fetchMock;
	});

	beforeEach(() => {
		fetchMock.mockReset();
	});

	it("reuse a plan found by its encoded week start", async () => {
		const plan = { id: "plan-1", weekStart: "2026-08-17", meals: [] };
		fetchMock.mockResolvedValue(response(200, plan));

		await expect(loadOrCreateMealPlan("2026-08-17")).resolves.toEqual(plan);
		expect(fetchMock).toHaveBeenCalledWith(
			"/api/meal-plans?weekStart=2026-08-17",
		);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("create a plan only after the durable lookup returns 404", async () => {
		const plan = { id: "plan-2", weekStart: "2026-08-17", meals: [] };
		fetchMock
			.mockResolvedValueOnce(response(404))
			.mockResolvedValueOnce(response(201, plan));

		await expect(loadOrCreateMealPlan("2026-08-17")).resolves.toEqual(plan);
		expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/meal-plans", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ weekStart: "2026-08-17" }),
		});
	});

	it("recover a concurrently created plan after POST returns 409", async () => {
		const winningPlan = {
			id: "plan-winner",
			weekStart: "2026-08-17",
			meals: [],
		};
		fetchMock
			.mockResolvedValueOnce(response(404))
			.mockResolvedValueOnce(response(409))
			.mockResolvedValueOnce(response(200, winningPlan));

		await expect(loadOrCreateMealPlan("2026-08-17")).resolves.toEqual(
			winningPlan,
		);
		expect(fetchMock).toHaveBeenCalledTimes(3);
		expect(fetchMock).toHaveBeenNthCalledWith(
			1,
			"/api/meal-plans?weekStart=2026-08-17",
		);
		expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/meal-plans", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ weekStart: "2026-08-17" }),
		});
		expect(fetchMock).toHaveBeenNthCalledWith(
			3,
			"/api/meal-plans?weekStart=2026-08-17",
			undefined,
		);
	});

	it("surface lookup errors without attempting plan creation", async () => {
		fetchMock.mockResolvedValue(response(500));

		await expect(loadOrCreateMealPlan("2026-08-17")).rejects.toThrow(
			"Unable to load the week (500)",
		);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it.each([
		[false, "POST"],
		[true, "PUT"],
	] as const)(
		"save a meal with occupied=%s using %s and the complete payload",
		async (isOccupied, method) => {
			fetchMock.mockResolvedValue(response(204));
			const meal = {
				day: "2026-08-18",
				slot: "lunch" as const,
				cookedDishId: "dish-1",
			};

			await saveMeal("plan-1", meal, isOccupied);

			expect(fetchMock).toHaveBeenCalledWith(
				"/api/meal-plans/plan-1/meals",
				{
					method,
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(meal),
				},
			);
		},
	);

	it("remove a meal with DELETE and its day/slot identity", async () => {
		fetchMock.mockResolvedValue(response(204));

		await removeMeal("plan-1", "2026-08-19", "dinner");

		expect(fetchMock).toHaveBeenCalledWith("/api/meal-plans/plan-1/meals", {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ day: "2026-08-19", slot: "dinner" }),
		});
	});

	it("load a plan and accept an empty shopping list", async () => {
		const plan = { id: "plan-1", weekStart: "2026-08-17", meals: [] };
		fetchMock
			.mockResolvedValueOnce(response(200, plan))
			.mockResolvedValueOnce(response(200, []));

		await expect(loadMealPlan("2026-08-17")).resolves.toEqual(plan);
		await expect(loadShoppingList("plan-1")).resolves.toEqual([]);
	});

	it("surface shopping-list request errors", async () => {
		fetchMock.mockResolvedValue(response(503));

		await expect(loadShoppingList("plan-1")).rejects.toThrow(
			"Request failed with status 503",
		);
	});

	it("consume only the final paginated cooked-dish catalog", async () => {
		const firstPageDishes = [
			{ id: "dish-1", name: "Rice", description: "Simple rice" },
		];
		const laterDish = {
			id: "dish-51",
			name: "Zucchini",
			description: "Available beyond page one",
		};
		expect(() => parseCookedDishCatalog(firstPageDishes)).toThrow(
			"Cooked dish catalog has an invalid response shape",
		);
		fetchMock
			.mockResolvedValueOnce(
				response(200, {
					items: firstPageDishes,
					pagination: {
						page: 1,
						pageSize: 50,
						totalItems: 51,
						totalPages: 2,
					},
				}),
			)
			.mockResolvedValueOnce(
				response(200, {
					items: [laterDish],
					pagination: {
						page: 2,
						pageSize: 50,
						totalItems: 51,
						totalPages: 2,
					},
				}),
			);
		expect(
			parseCookedDishCatalog({
				items: firstPageDishes,
				pagination: {
					page: 1,
					pageSize: 50,
					totalItems: 1,
					totalPages: 1,
				},
			}),
		).toEqual(firstPageDishes);
		await expect(loadCookedDishCatalog()).resolves.toEqual([
			...firstPageDishes,
			laterDish,
		]);
		expect(fetchMock).toHaveBeenNthCalledWith(
			1,
			"/api/cooked-dishes?page=1&pageSize=50&sortBy=name&sortDirection=asc",
			undefined,
		);
		expect(fetchMock).toHaveBeenNthCalledWith(
			2,
			"/api/cooked-dishes?page=2&pageSize=50&sortBy=name&sortDirection=asc",
			undefined,
		);
	});
});
