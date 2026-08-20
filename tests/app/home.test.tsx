/** @jest-environment jsdom */

import "@testing-library/jest-dom";

import {
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as searchApi from "../../src/app/cooked-dish-search";
import Home from "../../src/app/page";

jest.mock("../../src/app/cooked-dish-search", () => {
	const actual = jest.requireActual("../../src/app/cooked-dish-search");

	return { ...actual, loadCookedDishSearch: jest.fn() };
});

const loadSearch = jest.mocked(searchApi.loadCookedDishSearch);

function item(id: string, name: string, average: number | null, total: number) {
	return {
		id,
		name,
		description: `${name} description`,
		ingredients: [{ name: "Rice", type: "main" }],
		cookedAt: "2026-08-20T10:00:00.000Z",
		ratingSummary: { average, total },
	};
}

function result(
	items: ReturnType<typeof item>[],
	page = 1,
	totalPages = 1,
	totalItems = items.length,
): searchApi.CookedDishSearchResponse {
	return {
		items,
		pagination: { page, pageSize: 12, totalItems, totalPages },
	};
}

function deferred<T>() {
	let resolve!: (value: T) => void;
	let reject!: (reason?: unknown) => void;
	const promise = new Promise<T>((resolvePromise, rejectPromise) => {
		resolve = resolvePromise;
		reject = rejectPromise;
	});

	return { promise, resolve, reject };
}

describe("Home cooked-dish search should", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("show loading then results, rating summaries and pagination metadata", async () => {
		const pending = deferred<searchApi.CookedDishSearchResponse>();
		loadSearch.mockReturnValue(pending.promise);
		render(<Home />);
		expect(screen.getByText("Loading cooked dishes…")).toBeInTheDocument();

		pending.resolve(
			result(
				[
					item("rated", "Rated soup", 4.5, 2),
					item("new", "New rice", null, 0),
				],
				1,
				2,
				13,
			),
		);
		expect(await screen.findByText("Rated soup")).toBeInTheDocument();
		expect(
			screen.getByLabelText("4.5 out of 5 from 2 ratings"),
		).toBeInTheDocument();
		expect(screen.getByLabelText("Not rated yet")).toBeInTheDocument();
		expect(screen.getByText("Showing 2 of 13")).toBeInTheDocument();
		expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Previous page" }),
		).toBeDisabled();
		expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled();
	});

	it("submit combined filters and ordering, then reset them", async () => {
		loadSearch.mockResolvedValue(result([]));
		const user = userEvent.setup();
		render(<Home />);
		await screen.findByText("No cooked dishes match these filters.");

		await user.type(
			screen.getByLabelText("Search name or description"),
			" soup ",
		);
		await user.click(screen.getByLabelText("Main"));
		await user.click(screen.getByLabelText("Household staple"));
		await user.selectOptions(screen.getByLabelText("Minimum rating"), "4");
		fireEvent.change(screen.getByLabelText("Cooked from"), {
			target: { value: "2026-01-01" },
		});
		fireEvent.change(screen.getByLabelText("Cooked to"), {
			target: { value: "2026-12-31" },
		});
		await user.selectOptions(screen.getByLabelText("Sort by"), "rating");
		await user.selectOptions(screen.getByLabelText("Direction"), "asc");
		await user.click(screen.getByRole("button", { name: "Search dishes" }));

		await waitFor(() =>
			expect(loadSearch).toHaveBeenLastCalledWith(
				expect.objectContaining({
					text: " soup ",
					ingredientTypes: ["main", "household_staple"],
					minimumRating: "4",
					cookedFrom: "2026-01-01",
					cookedTo: "2026-12-31",
					sortBy: "rating",
					sortDirection: "asc",
					page: 1,
				}),
				expect.any(AbortSignal),
			),
		);
		await user.click(screen.getByRole("button", { name: "Reset filters" }));
		await waitFor(() =>
			expect(loadSearch).toHaveBeenLastCalledWith(
				searchApi.DEFAULT_SEARCH_CRITERIA,
				expect.any(AbortSignal),
			),
		);
	});

	it("request the next result page and update disabled pagination", async () => {
		loadSearch
			.mockResolvedValueOnce(
				result([item("one", "First", 3, 1)], 1, 2, 13),
			)
			.mockResolvedValueOnce(
				result([item("two", "Second", 5, 1)], 2, 2, 13),
			);
		const user = userEvent.setup();
		render(<Home />);
		await screen.findByText("First");
		await user.click(screen.getByRole("button", { name: "Next page" }));

		expect(await screen.findByText("Second")).toBeInTheDocument();
		expect(loadSearch).toHaveBeenLastCalledWith(
			expect.objectContaining({ page: 2 }),
			expect.any(AbortSignal),
		);
		expect(
			screen.getByRole("button", { name: "Next page" }),
		).toBeDisabled();
		expect(
			screen.getByRole("button", { name: "Previous page" }),
		).toBeEnabled();
	});

	it("show errors, retry and render the empty state", async () => {
		loadSearch
			.mockRejectedValueOnce(new Error("offline"))
			.mockResolvedValueOnce(result([]));
		const user = userEvent.setup();
		render(<Home />);
		const alert = await screen.findByRole("alert");
		expect(alert).toHaveTextContent("Cooked dishes could not be loaded");
		await user.click(within(alert).getByRole("button", { name: "Retry" }));

		expect(
			await screen.findByText("No cooked dishes match these filters."),
		).toBeInTheDocument();
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
	});

	it("ignore an older search response resolved after the current request", async () => {
		loadSearch.mockResolvedValueOnce(result([]));
		const oldRequest = deferred<searchApi.CookedDishSearchResponse>();
		const currentRequest = deferred<searchApi.CookedDishSearchResponse>();
		loadSearch
			.mockReturnValueOnce(oldRequest.promise)
			.mockReturnValueOnce(currentRequest.promise);
		const user = userEvent.setup();
		render(<Home />);
		await screen.findByText("No cooked dishes match these filters.");
		const text = screen.getByLabelText("Search name or description");
		const form = screen
			.getByRole("button", { name: "Search dishes" })
			.closest("form");
		if (!form) {
			throw new Error("search form not found");
		}

		await user.type(text, "old");
		fireEvent.submit(form);
		await waitFor(() => expect(loadSearch).toHaveBeenCalledTimes(2));
		await user.clear(text);
		await user.type(text, "current");
		fireEvent.submit(form);
		await waitFor(() => expect(loadSearch).toHaveBeenCalledTimes(3));

		currentRequest.resolve(result([item("current", "Current dish", 5, 1)]));
		expect(await screen.findByText("Current dish")).toBeInTheDocument();
		oldRequest.resolve(result([item("old", "Stale dish", 1, 1)]));
		await waitFor(() =>
			expect(screen.queryByText("Stale dish")).not.toBeInTheDocument(),
		);
		expect(screen.getByText("Current dish")).toBeInTheDocument();
		expect(
			screen.queryByText("Loading cooked dishes…"),
		).not.toBeInTheDocument();
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
	});
});
