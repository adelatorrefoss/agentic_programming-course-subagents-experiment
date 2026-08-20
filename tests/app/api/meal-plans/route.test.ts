import { NextRequest } from "next/server";

import { GET } from "../../../../src/app/api/meal-plans/route";
import { InvalidWeeklyMealPlanWeekStartError } from "../../../../src/contexts/dishes/meal-plans/domain/InvalidWeeklyMealPlanWeekStartError";
import { container } from "../../../../src/contexts/shared/infrastructure/dependency-injection/diod.config";

jest.mock(
	"../../../../src/contexts/shared/infrastructure/dependency-injection/diod.config",
	() => {
		const search = jest.fn();

		return {
			container: {
				get: (service: {
					name: string;
				}): { search: jest.Mock } | object =>
					service.name === "WeeklyMealPlanByWeekStartSearcher"
						? { search }
						: {},
				testDoubles: { search },
			},
		};
	},
);

const { search: mockSearch } = (
	container as unknown as {
		testDoubles: { search: jest.Mock };
	}
).testDoubles;

function request(query = ""): NextRequest {
	return new NextRequest(`http://localhost/api/meal-plans${query}`);
}

describe("GET /api/meal-plans should", () => {
	let consoleError: jest.SpyInstance;

	beforeAll(() => {
		consoleError = jest
			.spyOn(console, "error")
			.mockImplementation(() => {});
	});

	afterAll(() => {
		consoleError.mockRestore();
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("return the plan found by a valid Monday week start", async () => {
		const plan = {
			id: "8d0a93df-84b5-46b9-8b20-bff6fb19c31b",
			weekStart: "2026-08-17",
			meals: [],
		};
		mockSearch.mockResolvedValue(plan);

		const response = await GET(request("?weekStart=2026-08-17"), undefined);

		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual(plan);
		expect(mockSearch).toHaveBeenCalledWith("2026-08-17");
	});

	it("return a consistent 404 when the week has no plan", async () => {
		mockSearch.mockResolvedValue(null);

		const response = await GET(request("?weekStart=2026-08-17"), undefined);

		expect(response.status).toBe(404);
		await expect(response.json()).resolves.toEqual({
			error: {
				type: "NotFound",
				description: "Resource not found",
				params: {},
			},
		});
	});

	it.each(["", "?weekStart=2026-08-18"])(
		"return 400 for a missing or malformed Monday (%s)",
		async (query) => {
			const weekStart = query === "" ? "" : "2026-08-18";
			mockSearch.mockRejectedValue(
				new InvalidWeeklyMealPlanWeekStartError(weekStart),
			);
			const response = await GET(request(query), undefined);

			expect(response.status).toBe(400);
			await expect(response.json()).resolves.toEqual({
				error: {
					type: "InvalidWeeklyMealPlanWeekStartError",
					params: {
						weekStart,
					},
				},
			});
			expect(mockSearch).toHaveBeenCalledWith(weekStart);
		},
	);
});
