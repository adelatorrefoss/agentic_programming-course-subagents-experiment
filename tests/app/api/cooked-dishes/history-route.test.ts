import { NextRequest } from "next/server";

import { GET } from "../../../../src/app/api/cooked-dishes/[uuid]/history/route";
import { CookedDishNotFoundError } from "../../../../src/contexts/dishes/cooked-dishes/domain/CookedDishNotFoundError";
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

const mockSearch = (
	container as unknown as { testDoubles: { search: jest.Mock } }
).testDoubles.search;

describe("GET cooked dish history should", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.spyOn(console, "error").mockImplementation();
	});
	afterEach(() => jest.restoreAllMocks());

	it("return the history envelope", async () => {
		const items = [{ id: "event" }];
		mockSearch.mockResolvedValue(items);
		const response = await GET(
			new NextRequest("http://localhost/api/cooked-dishes/id/history"),
			{
				params: Promise.resolve({ uuid: "dish-id" }),
			},
		);
		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({ items });
		expect(mockSearch).toHaveBeenCalledWith("dish-id");
	});

	it("return 404 when the dish is missing", async () => {
		mockSearch.mockRejectedValue(new CookedDishNotFoundError("dish-id"));
		const response = await GET(
			new NextRequest("http://localhost/api/cooked-dishes/id/history"),
			{
				params: Promise.resolve({ uuid: "dish-id" }),
			},
		);
		expect(response.status).toBe(404);
	});
});
