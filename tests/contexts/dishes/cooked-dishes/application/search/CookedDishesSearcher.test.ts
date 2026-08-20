import { CookedDishesSearcher } from "../../../../../../src/contexts/dishes/cooked-dishes/application/search/CookedDishesSearcher";
import { CookedDishRepository } from "../../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDishRepository";

describe("CookedDishesSearcher should", () => {
	it("validate criteria, delegate once and calculate pagination metadata", async () => {
		const search = jest.fn().mockResolvedValue({
			items: [
				{
					id: "dish-1",
					name: "Soup",
					description: "Hot soup",
					ingredients: [],
					cookedAt: "2026-08-20T12:00:00.000Z",
					ratingSummary: { average: null, total: 0 },
				},
			],
			totalItems: 13,
		});
		const repository = { search } as unknown as CookedDishRepository;
		const searcher = new CookedDishesSearcher(repository);

		await expect(
			searcher.search({
				page: 2,
				pageSize: 5,
				ingredientTypes: ["main", "main"],
			}),
		).resolves.toMatchObject({
			items: [expect.objectContaining({ id: "dish-1" })],
			pagination: { page: 2, pageSize: 5, totalItems: 13, totalPages: 3 },
		});
		expect(search).toHaveBeenCalledTimes(1);
		expect(search.mock.calls[0][0]).toMatchObject({
			ingredientTypes: ["main"],
			page: 2,
			pageSize: 5,
		});
	});

	it("return zero pages while preserving requested out-of-range page", async () => {
		const search = jest
			.fn()
			.mockResolvedValue({ items: [], totalItems: 0 });
		const searcher = new CookedDishesSearcher({
			search,
		} as unknown as CookedDishRepository);

		await expect(searcher.search({ page: 99 })).resolves.toEqual({
			items: [],
			pagination: {
				page: 99,
				pageSize: 12,
				totalItems: 0,
				totalPages: 0,
			},
		});
	});
});
