export interface CookedDishSearchItem {
	id: string;
	name: string;
	description: string;
	ingredients: { name: string; type: string }[];
	cookedAt: string;
	ratingSummary: { average: number | null; total: number };
}

export interface CookedDishRepositorySearchResult {
	items: CookedDishSearchItem[];
	totalItems: number;
}

export interface CookedDishSearchResult {
	items: CookedDishSearchItem[];
	pagination: {
		page: number;
		pageSize: number;
		totalItems: number;
		totalPages: number;
	};
}
