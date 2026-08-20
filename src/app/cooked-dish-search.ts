export type IngredientType = "main" | "household_staple";
export type CookedDishSortBy = "cookedAt" | "name" | "rating";
export type SortDirection = "asc" | "desc";

export interface CookedDishSearchCriteria {
	text: string;
	ingredientTypes: IngredientType[];
	minimumRating: string;
	cookedFrom: string;
	cookedTo: string;
	sortBy: CookedDishSortBy;
	sortDirection: SortDirection;
	page: number;
	pageSize: number;
}

export interface CookedDishSearchItem {
	id: string;
	name: string;
	description: string;
	ingredients: { name: string; type: string }[];
	cookedAt: string;
	ratingSummary: { average: number | null; total: number };
}

export interface CookedDishSearchResponse {
	items: CookedDishSearchItem[];
	pagination: {
		page: number;
		pageSize: number;
		totalItems: number;
		totalPages: number;
	};
}

export const DEFAULT_SEARCH_CRITERIA: CookedDishSearchCriteria = {
	text: "",
	ingredientTypes: [],
	minimumRating: "",
	cookedFrom: "",
	cookedTo: "",
	sortBy: "cookedAt",
	sortDirection: "desc",
	page: 1,
	pageSize: 12,
};

export function cookedDishSearchParams(
	criteria: CookedDishSearchCriteria,
): URLSearchParams {
	const params = new URLSearchParams({
		sortBy: criteria.sortBy,
		sortDirection: criteria.sortDirection,
		page: String(criteria.page),
		pageSize: String(criteria.pageSize),
	});

	const text = criteria.text.trim();
	if (text !== "") {
		params.set("text", text);
	}
	for (const type of criteria.ingredientTypes) {
		params.append("ingredientType", type);
	}
	if (criteria.minimumRating !== "") {
		params.set("minimumRating", criteria.minimumRating);
	}
	if (criteria.cookedFrom !== "") {
		params.set("cookedFrom", criteria.cookedFrom);
	}
	if (criteria.cookedTo !== "") {
		params.set("cookedTo", criteria.cookedTo);
	}

	return params;
}

export async function loadCookedDishSearch(
	criteria: CookedDishSearchCriteria,
	signal?: AbortSignal,
): Promise<CookedDishSearchResponse> {
	const response = await fetch(
		`/api/cooked-dishes?${cookedDishSearchParams(criteria).toString()}`,
		{ signal },
	);

	if (!response.ok) {
		throw new Error(`Cooked dish search failed (${response.status})`);
	}

	return (await response.json()) as CookedDishSearchResponse;
}
