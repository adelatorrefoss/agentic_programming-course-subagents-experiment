import { NextRequest } from "next/server";

import { PUT } from "../../../../src/app/api/cooked-dishes/[uuid]/route";
import { container } from "../../../../src/contexts/shared/infrastructure/dependency-injection/diod.config";

jest.mock(
	"../../../../src/contexts/shared/infrastructure/dependency-injection/diod.config",
	() => {
		const upsert = jest.fn();

		return {
			container: {
				get: (): { search: jest.Mock; upsert: jest.Mock } => ({
					search: jest.fn(),
					upsert,
				}),
				testDoubles: { upsert },
			},
		};
	},
);

const { upsert: mockUpsert } = (
	container as unknown as { testDoubles: { upsert: jest.Mock } }
).testDoubles;

function request(actor?: string): NextRequest {
	return new NextRequest("http://localhost/api/cooked-dishes/dish-id", {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			...(actor === undefined ? {} : { "X-Actor-Id": actor }),
		},
		body: JSON.stringify({
			name: "Dish",
			description: "Description",
			ingredients: [{ name: "rice", type: "main" }],
		}),
	});
}

describe("PUT cooked dish should", () => {
	beforeEach(() => jest.clearAllMocks());

	it("require a non-blank actor", async () => {
		const response = await PUT(request("  "), {
			params: Promise.resolve({ uuid: "dish-id" }),
		});

		expect(response.status).toBe(400);
		expect(mockUpsert).not.toHaveBeenCalled();
	});

	it("pass the trimmed actor to the upserter", async () => {
		mockUpsert.mockResolvedValue("created");

		const response = await PUT(request(" chef "), {
			params: Promise.resolve({ uuid: "dish-id" }),
		});

		expect(response.status).toBe(201);
		expect(mockUpsert).toHaveBeenCalledWith(
			"dish-id",
			"Dish",
			"Description",
			[{ name: "rice", type: "main" }],
			"chef",
		);
	});
});
