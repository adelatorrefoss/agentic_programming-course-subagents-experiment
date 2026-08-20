import { NextRequest } from "next/server";

import { GET } from "../../../../src/app/api/cooked-dishes/route";
import { InvalidCookedDishSearchCriteriaError } from "../../../../src/contexts/dishes/cooked-dishes/domain/InvalidCookedDishSearchCriteriaError";
import { container } from "../../../../src/contexts/shared/infrastructure/dependency-injection/diod.config";

jest.mock(
	"../../../../src/contexts/shared/infrastructure/dependency-injection/diod.config",
	() => {
		const search = jest.fn();

		return {
			container: {
				get: (): { search: jest.Mock } => ({ search }),
				testDoubles: { search },
			},
		};
	},
);

const { search: mockSearch } = (
	container as unknown as { testDoubles: { search: jest.Mock } }
).testDoubles;

function request(query = ""): NextRequest {
	return new NextRequest(`http://localhost/api/cooked-dishes${query}`);
}

describe("GET /api/cooked-dishes should", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.spyOn(console, "error").mockImplementation();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("parse repeated and scalar parameters and return the search envelope", async () => {
		const result = {
			items: [
				{
					id: "rated-dish",
					name: "Rated dish",
					description: "A dish with ratings",
					ingredients: [{ name: "tomato", type: "main" }],
					cookedAt: "2026-08-20T10:00:00.000Z",
					ratingSummary: { average: 4.5, total: 2 },
				},
			],
			pagination: { page: 2, pageSize: 5, totalItems: 6, totalPages: 2 },
		};
		mockSearch.mockResolvedValue(result);

		const response = await GET(
			request(
				"?text=chef%27s%20rice&ingredientType=main&ingredientType=household_staple&minimumRating=4.5&cookedFrom=2026-01-01&cookedTo=2026-12-31&sortBy=rating&sortDirection=asc&page=2&pageSize=5",
			),
			undefined,
		);

		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual(result);
		expect(mockSearch).toHaveBeenCalledWith({
			text: "chef's rice",
			ingredientTypes: ["main", "household_staple"],
			minimumRating: "4.5",
			cookedFrom: "2026-01-01",
			cookedTo: "2026-12-31",
			sortBy: "rating",
			sortDirection: "asc",
			page: "2",
			pageSize: "5",
		});
	});

	it("pass undefined scalars and an empty repeated list for defaults", async () => {
		mockSearch.mockResolvedValue({
			items: [],
			pagination: { page: 1, pageSize: 12, totalItems: 0, totalPages: 0 },
		});

		await GET(request(), undefined);

		expect(mockSearch).toHaveBeenCalledWith({
			text: undefined,
			ingredientTypes: [],
			minimumRating: undefined,
			cookedFrom: undefined,
			cookedTo: undefined,
			sortBy: undefined,
			sortDirection: undefined,
			page: undefined,
			pageSize: undefined,
		});
	});

	it("return the consistent 400 envelope for invalid criteria", async () => {
		mockSearch.mockRejectedValue(
			new InvalidCookedDishSearchCriteriaError(
				"pageSize",
				51,
				"must be an integer between 1 and 50",
			),
		);

		const response = await GET(request("?pageSize=51"), undefined);

		expect(response.status).toBe(400);
		await expect(response.json()).resolves.toEqual({
			error: {
				type: "InvalidCookedDishSearchCriteria",
				params: {
					field: "pageSize",
					value: 51,
					reason: "must be an integer between 1 and 50",
				},
			},
		});
	});
});
