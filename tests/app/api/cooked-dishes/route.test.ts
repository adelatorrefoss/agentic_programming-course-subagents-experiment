import { GET } from "../../../../src/app/api/cooked-dishes/route";
import { container } from "../../../../src/contexts/shared/infrastructure/dependency-injection/diod.config";

jest.mock(
	"../../../../src/contexts/shared/infrastructure/dependency-injection/diod.config",
	() => {
		const searchAll = jest.fn();

		return {
			container: {
				get: (): { searchAll: jest.Mock } => ({ searchAll }),
				testDoubles: { searchAll },
			},
		};
	},
);

const { searchAll: mockSearchAll } = (
	container as unknown as {
		testDoubles: { searchAll: jest.Mock };
	}
).testDoubles;

describe("GET /api/cooked-dishes should", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("include rating summaries for rated and unrated home cards", async () => {
		mockSearchAll.mockResolvedValue([
			{
				id: "rated-dish",
				name: "Rated dish",
				description: "A dish with ratings",
				ingredients: [{ name: "tomato", type: "main" }],
				ratingSummary: { average: 4.5, total: 2 },
			},
			{
				id: "unrated-dish",
				name: "Unrated dish",
				description: "A dish without ratings",
				ingredients: [{ name: "rice", type: "staple" }],
				ratingSummary: { average: null, total: 0 },
			},
		]);

		const response = await GET();

		await expect(response.json()).resolves.toEqual([
			expect.objectContaining({
				id: "rated-dish",
				ratingSummary: expect.objectContaining({
					average: 4.5,
					total: 2,
				}),
			}),
			expect.objectContaining({
				id: "unrated-dish",
				ratingSummary: expect.objectContaining({
					average: null,
					total: 0,
				}),
			}),
		]);
		expect(mockSearchAll).toHaveBeenCalledTimes(1);
	});
});
