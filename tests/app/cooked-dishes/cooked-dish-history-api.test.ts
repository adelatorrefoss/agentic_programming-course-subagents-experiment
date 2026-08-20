/** @jest-environment jsdom */

import {
	loadCookedDishHistory,
	parseCookedDishHistory,
} from "../../../src/app/cooked-dishes/[id]/cooked-dish-history-api";

const created = {
	id: "event-b",
	type: "cooked_dish.created" as const,
	entity: { type: "cooked_dish" as const, id: "dish/one" },
	author: "Ada",
	occurredAt: "2026-08-20T10:00:00.000Z",
	changes: [{ field: "name", before: null, after: "Soup" }],
};

describe("cooked dish history API should", () => {
	beforeEach(() => {
		global.fetch = jest.fn();
	});

	it("request the history endpoint and parse its items", async () => {
		jest.mocked(fetch).mockResolvedValue({
			ok: true,
			json: async () => ({ items: [created] }),
		} as Response);

		await expect(loadCookedDishHistory("dish/one")).resolves.toEqual([
			created,
		]);
		expect(fetch).toHaveBeenCalledWith(
			"/api/cooked-dishes/dish%2Fone/history",
			{ signal: undefined },
		);
	});

	it("sort chronologically and use the id as a stable tie breaker", () => {
		const earliest = {
			...created,
			id: "event-c",
			occurredAt: "2026-08-19T10:00:00.000Z",
		};
		const tied = { ...created, id: "event-a" };

		expect(
			parseCookedDishHistory({ items: [created, earliest, tied] }).map(
				(entry) => entry.id,
			),
		).toEqual(["event-c", "event-a", "event-b"]);
	});

	it("reject invalid payloads and non-success responses", async () => {
		expect(() =>
			parseCookedDishHistory({ items: [{ id: "bad" }] }),
		).toThrow("invalid response shape");
		jest.mocked(fetch).mockResolvedValue({
			ok: false,
			status: 500,
		} as Response);
		await expect(loadCookedDishHistory("dish-1")).rejects.toThrow("(500)");
	});
});
