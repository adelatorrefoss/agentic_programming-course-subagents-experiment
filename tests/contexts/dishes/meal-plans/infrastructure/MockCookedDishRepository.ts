import { CookedDish } from "../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDish";
import { CookedDishId } from "../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDishId";
import { CookedDishRepository } from "../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDishRepository";
import { CookedDishSearchCriteria } from "../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDishSearchCriteria";
import { CookedDishRepositorySearchResult } from "../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDishSearchResult";

export class MockCookedDishRepository implements CookedDishRepository {
	private defaultResult: CookedDish | null = null;
	private readonly results = new Map<string, CookedDish | null>();

	async save(_dish: CookedDish): Promise<void> {
		return Promise.resolve();
	}

	async update(_dish: CookedDish): Promise<void> {
		return Promise.resolve();
	}

	async searchById(id: CookedDishId): Promise<CookedDish | null> {
		return this.results.has(id.value)
			? (this.results.get(id.value) ?? null)
			: this.defaultResult;
	}

	shouldSearchByIdReturn(dish: CookedDish | null): void {
		this.defaultResult = dish;
	}

	shouldSearchByIdReturnFor(id: string, dish: CookedDish | null): void {
		this.results.set(id, dish);
	}

	async searchAll(): Promise<CookedDish[]> {
		return [];
	}

	async search(
		_criteria: CookedDishSearchCriteria,
	): Promise<CookedDishRepositorySearchResult> {
		return { items: [], totalItems: 0 };
	}

	async searchByRecentSimilarIngredients(
		_ingredientNames: string[],
	): Promise<CookedDish[]> {
		return [];
	}
}
