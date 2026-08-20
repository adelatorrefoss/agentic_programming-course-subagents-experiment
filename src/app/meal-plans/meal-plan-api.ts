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

interface CookedDishCatalogPage {
	items: CookedDishOption[];
	pagination: { page: number; totalPages: number };
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
	return parseCookedDishCatalogPage(payload).items;
}

function parseCookedDishCatalogPage(payload: unknown): CookedDishCatalogPage {
	if (
		typeof payload === "object" &&
		payload !== null &&
		"items" in payload &&
		Array.isArray(payload.items) &&
		"pagination" in payload &&
		typeof payload.pagination === "object" &&
		payload.pagination !== null &&
		"page" in payload.pagination &&
		"totalPages" in payload.pagination &&
		typeof payload.pagination.page === "number" &&
		typeof payload.pagination.totalPages === "number"
	) {
		return payload as CookedDishCatalogPage;
	}

	throw new Error("Cooked dish catalog has an invalid response shape");
}

export async function loadCookedDishCatalog(): Promise<CookedDishOption[]> {
	async function loadPage(
		page: number,
		accumulated: CookedDishOption[],
	): Promise<CookedDishOption[]> {
		const payload = await requestJson<unknown>(
			`/api/cooked-dishes?page=${page}&pageSize=50&sortBy=name&sortDirection=asc`,
		);
		const result = parseCookedDishCatalogPage(payload);
		const dishes = [...accumulated, ...result.items];

		return page < result.pagination.totalPages
			? loadPage(page + 1, dishes)
			: dishes;
	}

	return loadPage(1, []);
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
