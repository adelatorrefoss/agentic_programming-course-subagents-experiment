import { NextRequest } from "next/server";

import { PUT } from "../../../../src/app/api/cooked-dishes/[uuid]/route";
import { container } from "../../../../src/contexts/shared/infrastructure/dependency-injection/diod.config";

jest.mock(
	"../../../../src/contexts/shared/infrastructure/dependency-injection/diod.config",
	() => {
		const upsert = jest.fn();

		return {
			container: {
				get: (identifier: { name?: string }): unknown =>
					identifier.name === "CookedDishUpserter"
						? { upsert }
						: { search: jest.fn() },
				testDoubles: { upsert },
			},
		};
	},
);

const mockUpsert = (
	container as unknown as { testDoubles: { upsert: jest.Mock } }
).testDoubles.upsert;
const body = { name: "Soup", description: "Warm", ingredients: [] };
function request(actor?: string): NextRequest {
	const headers = new Headers({ "Content-Type": "application/json" });
	if (actor !== undefined) {
		headers.set("X-Actor-Id", actor);
	}

	return new NextRequest("http://localhost/api/cooked-dishes/id", {
		method: "PUT",
		headers,
		body: JSON.stringify(body),
	});
}

describe("PUT cooked dish should", () => {
	beforeEach(() => jest.clearAllMocks());

	it.each([undefined, "   "])(
		"reject missing actor %s before upserting",
		async (actor) => {
			const response = await PUT(request(actor), {
				params: Promise.resolve({ uuid: "dish-id" }),
			});
			expect(response.status).toBe(400);
			expect(mockUpsert).not.toHaveBeenCalled();
		},
	);

	it.each([
		["created", 201, undefined],
		["updated", 200, { status: "updated" }],
		["unchanged", 200, { status: "unchanged" }],
	] as const)("map %s result", async (result, status, responseBody) => {
		mockUpsert.mockResolvedValue(result);
		const response = await PUT(request(" chef "), {
			params: Promise.resolve({ uuid: "dish-id" }),
		});
		expect(response.status).toBe(status);
		if (responseBody) {
			await expect(response.json()).resolves.toEqual(responseBody);
		}
		expect(mockUpsert).toHaveBeenCalledWith(
			"dish-id",
			body.name,
			body.description,
			body.ingredients,
			"chef",
		);
	});
});
