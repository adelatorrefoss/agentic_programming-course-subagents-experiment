export type MealSlot = "breakfast" | "lunch" | "dinner";

export interface PlannedMeal {
	day: string;
	slot: MealSlot;
	cookedDishId: string;
}

export interface WeeklyMealPlan {
	id: string;
	weekStart: string;
	meals: PlannedMeal[];
}

export interface CookedDishOption {
	id: string;
	name: string;
	description: string;
}

export interface ShoppingListItem {
	name: string;
	type: string;
	quantity: number;
}

async function requestJson<T>(
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<T> {
	const response = await fetch(input, init);

	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}`);
	}

	return (await response.json()) as T;
}

export function parseCookedDishCatalog(payload: unknown): CookedDishOption[] {
	if (
		typeof payload === "object" &&
		payload !== null &&
		"items" in payload &&
		Array.isArray(payload.items)
	) {
		return payload.items as CookedDishOption[];
	}

	throw new Error("Cooked dish catalog has an invalid response shape");
}

export async function loadCookedDishCatalog(): Promise<CookedDishOption[]> {
	const payload = await requestJson<unknown>(
		"/api/cooked-dishes?page=1&pageSize=50&sortBy=name&sortDirection=asc",
	);

	return parseCookedDishCatalog(payload);
}

export async function loadOrCreateMealPlan(
	weekStart: string,
): Promise<WeeklyMealPlan> {
	const response = await fetch(
		`/api/meal-plans?weekStart=${encodeURIComponent(weekStart)}`,
	);

	if (response.ok) {
		return (await response.json()) as WeeklyMealPlan;
	}

	if (response.status !== 404) {
		throw new Error(`Unable to load the week (${response.status})`);
	}

	const createResponse = await fetch("/api/meal-plans", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ weekStart }),
	});

	if (createResponse.ok) {
		return (await createResponse.json()) as WeeklyMealPlan;
	}

	if (createResponse.status === 409) {
		return loadMealPlan(weekStart);
	}

	throw new Error(`Unable to create the week (${createResponse.status})`);
}

export async function loadMealPlan(weekStart: string): Promise<WeeklyMealPlan> {
	return requestJson<WeeklyMealPlan>(
		`/api/meal-plans?weekStart=${encodeURIComponent(weekStart)}`,
	);
}

export async function loadShoppingList(
	planId: string,
): Promise<ShoppingListItem[]> {
	return requestJson<ShoppingListItem[]>(
		`/api/meal-plans/${planId}/shopping-list`,
	);
}

export async function saveMeal(
	planId: string,
	meal: PlannedMeal,
	isOccupied: boolean,
): Promise<void> {
	await requestWithoutBody(`/api/meal-plans/${planId}/meals`, {
		method: isOccupied ? "PUT" : "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(meal),
	});
}

export async function removeMeal(
	planId: string,
	day: string,
	slot: MealSlot,
): Promise<void> {
	await requestWithoutBody(`/api/meal-plans/${planId}/meals`, {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ day, slot }),
	});
}

async function requestWithoutBody(
	input: RequestInfo | URL,
	init: RequestInit,
): Promise<void> {
	const response = await fetch(input, init);

	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}`);
	}
}
