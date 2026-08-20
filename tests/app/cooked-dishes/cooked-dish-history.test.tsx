/** @jest-environment jsdom */

import "@testing-library/jest-dom";

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import * as historyApi from "../../../src/app/cooked-dishes/[id]/cooked-dish-history-api";
import { CookedDishHistory } from "../../../src/app/cooked-dishes/[id]/CookedDishHistory";

jest.mock(
	"../../../src/app/cooked-dishes/[id]/cooked-dish-history-api",
	() => ({ loadCookedDishHistory: jest.fn() }),
);

const loadHistory = jest.mocked(historyApi.loadCookedDishHistory);

function deferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((resolvePromise) => {
		resolve = resolvePromise;
	});

	return { promise, resolve };
}

const entries: historyApi.CookedDishHistoryEntry[] = [
	{
		id: "created",
		type: "cooked_dish.created",
		entity: { type: "cooked_dish", id: "dish-1" },
		author: "Ada",
		occurredAt: "2026-08-19T10:00:00.000Z",
		changes: [
			{ field: "name", before: null, after: "Tomato soup" },
			{
				field: "ingredients",
				before: [],
				after: [{ name: "Tomato", type: "main" }],
			},
		],
	},
	{
		id: "updated",
		type: "cooked_dish.updated",
		entity: { type: "cooked_dish", id: "dish-1" },
		author: "Grace",
		occurredAt: "2026-08-20T10:00:00.000Z",
		changes: [{ field: "name", before: "Tomato soup", after: "Red soup" }],
	},
];

describe("CookedDishHistory should", () => {
	beforeEach(() => jest.clearAllMocks());

	it("show loading and then an accessible chronological timeline", async () => {
		const pending = deferred<historyApi.CookedDishHistoryEntry[]>();
		loadHistory.mockReturnValue(pending.promise);
		render(<CookedDishHistory dishId="dish-1" />);
		expect(screen.getByText("Loading history…")).toBeInTheDocument();

		pending.resolve(entries);
		await screen.findByText("By Ada");
		const list = document.querySelector("ol");
		expect(list).not.toBeNull();
		if (!list) {
			throw new Error("Expected the history timeline");
		}
		const items = Array.from(list.children);
		expect(items).toHaveLength(2);
		expect(items[0]).toHaveTextContent("Created");
		expect(items[0]).toHaveTextContent("By Ada");
		expect(items[0]).toHaveTextContent("PreviousNone");
		expect(items[0]).toHaveTextContent("Name: Tomato");
		expect(items[1]).toHaveTextContent("Updated");
		expect(document.querySelectorAll("time")[0]).toHaveAttribute(
			"datetime",
			entries[0].occurredAt,
		);
	});

	it("render an empty state", async () => {
		loadHistory.mockResolvedValue([]);
		render(<CookedDishHistory dishId="dish-1" />);
		expect(
			await screen.findByText("No change history is available."),
		).toBeInTheDocument();
	});

	it("show an error and retry only the history request", async () => {
		loadHistory
			.mockRejectedValueOnce(new Error("offline"))
			.mockResolvedValueOnce(entries);
		const user = userEvent.setup();
		render(<CookedDishHistory dishId="dish-1" />);

		const alert = await screen.findByRole("alert");
		expect(alert).toHaveTextContent("could not be loaded");
		await user.click(within(alert).getByRole("button", { name: "Retry" }));
		expect(await screen.findByText("By Ada")).toBeInTheDocument();
		expect(loadHistory).toHaveBeenCalledTimes(2);
	});

	it("discard an older dish response when the id changes", async () => {
		const oldRequest = deferred<historyApi.CookedDishHistoryEntry[]>();
		loadHistory
			.mockReturnValueOnce(oldRequest.promise)
			.mockResolvedValueOnce(entries.slice(1));
		const { rerender } = render(<CookedDishHistory dishId="old" />);
		rerender(<CookedDishHistory dishId="dish-1" />);
		expect(await screen.findByText("By Grace")).toBeInTheDocument();
		oldRequest.resolve(entries.slice(0, 1));
		await waitFor(() =>
			expect(screen.queryByText("By Ada")).not.toBeInTheDocument(),
		);
	});
});
