/** @jest-environment jsdom */

import "@testing-library/jest-dom";

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { mondayFor, moveWeek } from "../../../src/app/meal-plans/calendar";
import * as api from "../../../src/app/meal-plans/meal-plan-api";
import MealPlansPage from "../../../src/app/meal-plans/page";

jest.mock("../../../src/app/meal-plans/meal-plan-api", () => ({
	loadCookedDishCatalog: jest.fn(),
	loadMealPlan: jest.fn(),
	loadOrCreateMealPlan: jest.fn(),
	loadShoppingList: jest.fn(),
	removeMeal: jest.fn(),
	saveMeal: jest.fn(),
}));

const mocks = jest.mocked(api);
const currentWeek = mondayFor(new Date());
const dishes = [
	{ id: "dish-1", name: "Rice", description: "Simple rice" },
	{ id: "dish-2", name: "Soup", description: "Warm soup" },
];

function plan(
	id = "plan-1",
	weekStart = currentWeek,
	meals: api.PlannedMeal[] = [],
): api.WeeklyMealPlan {
	return { id, weekStart, meals };
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

describe("MealPlansPage should", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mocks.loadCookedDishCatalog.mockResolvedValue(dishes);
		mocks.loadOrCreateMealPlan.mockResolvedValue(plan());
		mocks.loadShoppingList.mockResolvedValue([]);
		mocks.loadMealPlan.mockResolvedValue(plan());
		mocks.saveMeal.mockResolvedValue();
		mocks.removeMeal.mockResolvedValue();
	});

	it("render loading, then an empty 7 by 3 grid and shopping list", async () => {
		const loadingPlan = deferred<api.WeeklyMealPlan>();
		mocks.loadOrCreateMealPlan.mockReturnValue(loadingPlan.promise);
		render(<MealPlansPage />);
		expect(screen.getByText("Loading weekly plan…")).toBeInTheDocument();

		loadingPlan.resolve(plan());
		const grid = await screen.findByRole("grid", {
			name: "Weekly meal plan",
		});
		expect(within(grid).getAllByRole("columnheader")).toHaveLength(8);
		expect(within(grid).getAllByRole("row")).toHaveLength(4);
		expect(within(grid).getAllByRole("rowheader")).toHaveLength(3);
		expect(within(grid).getAllByRole("gridcell")).toHaveLength(21);
		expect(
			await screen.findByText(
				"Assign meals to start building your shopping list.",
			),
		).toBeInTheDocument();
	});

	it("navigate to the next week and load its plan", async () => {
		const user = userEvent.setup();
		render(<MealPlansPage />);
		await screen.findByRole("grid");
		await user.click(screen.getByRole("button", { name: "Next" }));
		await waitFor(() =>
			expect(mocks.loadOrCreateMealPlan).toHaveBeenLastCalledWith(
				moveWeek(currentWeek, 1),
			),
		);
	});

	it("assign, replace and remove meals with the correct semantics", async () => {
		const occupiedMeal: api.PlannedMeal = {
			day: currentWeek,
			slot: "lunch",
			cookedDishId: "dish-1",
		};
		mocks.loadOrCreateMealPlan.mockResolvedValue(
			plan("plan-1", currentWeek, [occupiedMeal]),
		);
		mocks.loadMealPlan.mockResolvedValue(
			plan("plan-1", currentWeek, [occupiedMeal]),
		);
		const user = userEvent.setup();
		render(<MealPlansPage />);
		await screen.findByRole("grid");

		await user.selectOptions(
			screen.getByLabelText(/Mon breakfast/i),
			"dish-2",
		);
		expect(mocks.saveMeal).toHaveBeenCalledWith(
			"plan-1",
			{ day: currentWeek, slot: "breakfast", cookedDishId: "dish-2" },
			false,
		);
		await user.selectOptions(screen.getByLabelText(/Mon lunch/i), "dish-2");
		expect(mocks.saveMeal).toHaveBeenCalledWith(
			"plan-1",
			{ day: currentWeek, slot: "lunch", cookedDishId: "dish-2" },
			true,
		);
		await user.click(screen.getByRole("button", { name: /Remove lunch/i }));
		expect(mocks.removeMeal).toHaveBeenCalledWith(
			"plan-1",
			currentWeek,
			"lunch",
		);
	});

	it("disable the active cell while its mutation is pending", async () => {
		const pendingSave = deferred<void>();
		mocks.saveMeal.mockReturnValue(pendingSave.promise);
		const user = userEvent.setup();
		render(<MealPlansPage />);
		const breakfast = await screen.findByLabelText(/Mon breakfast/i);
		void user.selectOptions(breakfast, "dish-1");
		await waitFor(() => expect(breakfast).toBeDisabled());
		pendingSave.resolve();
		await waitFor(() => expect(breakfast).not.toBeDisabled());
	});

	it("show a load error and retry", async () => {
		mocks.loadOrCreateMealPlan
			.mockRejectedValueOnce(new Error("offline"))
			.mockResolvedValueOnce(plan());
		const user = userEvent.setup();
		render(<MealPlansPage />);
		const alert = await screen.findByRole("alert");
		expect(alert).toHaveTextContent("This week could not be loaded");
		await user.click(within(alert).getByRole("button", { name: "Retry" }));
		expect(await screen.findByRole("grid")).toBeInTheDocument();
		expect(mocks.loadOrCreateMealPlan).toHaveBeenCalledTimes(2);
	});

	it("retry a failed shopping list and render the recovered items", async () => {
		mocks.loadShoppingList
			.mockRejectedValueOnce(new Error("shopping offline"))
			.mockResolvedValueOnce([
				{ name: "Tomato", type: "main", quantity: 3 },
			]);
		const user = userEvent.setup();
		render(<MealPlansPage />);

		const alert = await screen.findByRole("alert");
		expect(alert).toHaveTextContent(
			"The shopping list could not be loaded.",
		);
		await user.click(within(alert).getByRole("button", { name: "Retry" }));

		expect(await screen.findByText("Tomato")).toBeInTheDocument();
		expect(screen.getByText("× 3")).toBeInTheDocument();
		expect(
			screen.queryByText("The shopping list could not be loaded."),
		).not.toBeInTheDocument();
		expect(mocks.loadShoppingList).toHaveBeenCalledTimes(2);
	});

	it("ignore an older week response resolved after the current week", async () => {
		const oldWeek = deferred<api.WeeklyMealPlan>();
		const newWeek = deferred<api.WeeklyMealPlan>();
		mocks.loadOrCreateMealPlan
			.mockReturnValueOnce(oldWeek.promise)
			.mockReturnValueOnce(newWeek.promise);
		const user = userEvent.setup();
		render(<MealPlansPage />);
		await user.click(screen.getByRole("button", { name: "Next" }));

		newWeek.resolve(plan("new-plan", moveWeek(currentWeek, 1)));
		await waitFor(() =>
			expect(mocks.loadShoppingList).toHaveBeenCalledWith("new-plan"),
		);
		oldWeek.resolve(plan("old-plan", currentWeek));
		await waitFor(() =>
			expect(mocks.loadShoppingList).toHaveBeenCalledTimes(1),
		);
		expect(mocks.loadShoppingList).not.toHaveBeenCalledWith("old-plan");
	});

	it("ignore an older shopping list resolved after the current week list", async () => {
		const oldList = deferred<api.ShoppingListItem[]>();
		const newList = deferred<api.ShoppingListItem[]>();
		mocks.loadOrCreateMealPlan
			.mockResolvedValueOnce(plan("old-plan", currentWeek))
			.mockResolvedValueOnce(
				plan("new-plan", moveWeek(currentWeek, 1)),
			);
		mocks.loadShoppingList
			.mockReturnValueOnce(oldList.promise)
			.mockReturnValueOnce(newList.promise);
		const user = userEvent.setup();
		render(<MealPlansPage />);
		await waitFor(() =>
			expect(mocks.loadShoppingList).toHaveBeenCalledWith("old-plan"),
		);

		await user.click(screen.getByRole("button", { name: "Next" }));
		await waitFor(() =>
			expect(mocks.loadShoppingList).toHaveBeenCalledWith("new-plan"),
		);
		newList.resolve([{ name: "Current rice", type: "staple", quantity: 2 }]);
		expect(await screen.findByText("Current rice")).toBeInTheDocument();
		expect(screen.queryByText("Updating shopping list…")).not.toBeInTheDocument();

		oldList.resolve([{ name: "Stale tomato", type: "main", quantity: 9 }]);
		await waitFor(() =>
			expect(screen.queryByText("Stale tomato")).not.toBeInTheDocument(),
		);
		expect(screen.getByText("Current rice")).toBeInTheDocument();
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
		expect(screen.queryByText("Updating shopping list…")).not.toBeInTheDocument();
	});
});
