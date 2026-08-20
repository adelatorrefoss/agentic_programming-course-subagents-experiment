import { CookedDish } from "./CookedDish";
import { CookedDishId } from "./CookedDishId";
import { CookedDishSearchCriteria } from "./CookedDishSearchCriteria";
import { CookedDishRepositorySearchResult } from "./CookedDishSearchResult";

export abstract class CookedDishRepository {
	abstract save(dish: CookedDish): Promise<void>;
	abstract update(dish: CookedDish): Promise<void>;

	abstract searchById(id: CookedDishId): Promise<CookedDish | null>;

	abstract searchAll(): Promise<CookedDish[]>;

	abstract search(
		criteria: CookedDishSearchCriteria,
	): Promise<CookedDishRepositorySearchResult>;

	abstract searchByRecentSimilarIngredients(
		ingredientNames: string[],
	): Promise<CookedDish[]>;
}
