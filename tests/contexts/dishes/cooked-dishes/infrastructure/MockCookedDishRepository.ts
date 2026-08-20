import { CookedDish } from "../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDish";
import { CookedDishId } from "../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDishId";
import { CookedDishRepository } from "../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDishRepository";
import { CookedDishSearchCriteria } from "../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDishSearchCriteria";
import { CookedDishRepositorySearchResult } from "../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDishSearchResult";

export class MockCookedDishRepository implements CookedDishRepository {
	private readonly mockSave = jest.fn();
	private readonly mockUpdate = jest.fn();
	private readonly mockSearchById = jest.fn();
	private readonly mockSearchAll = jest.fn();
	private readonly mockSearch = jest.fn();
	private readonly mockSearchByRecentSimilarIngredients = jest.fn();

	async save(dish: CookedDish): Promise<void> {
		expect(this.mockSave).toHaveBeenCalledWith(dish.toPrimitives());

		return Promise.resolve();
	}

	shouldSave(dish: CookedDish): void {
		this.mockSave(dish.toPrimitives());
	}

	async update(dish: CookedDish): Promise<void> {
		expect(this.mockUpdate).toHaveBeenCalledWith(dish.toPrimitives());

		return Promise.resolve();
	}

	shouldUpdate(dish: CookedDish): void {
		this.mockUpdate(dish.toPrimitives());
	}

	async searchById(_id: CookedDishId): Promise<CookedDish | null> {
		return this.mockSearchById() as CookedDish | null;
	}

	shouldSearchByIdReturn(dish: CookedDish | null): void {
		this.mockSearchById.mockReturnValue(dish);
	}

	async searchAll(): Promise<CookedDish[]> {
		return this.mockSearchAll() as CookedDish[];
	}

	shouldSearchAllReturn(dishes: CookedDish[]): void {
		this.mockSearchAll.mockReturnValue(dishes);
	}

	async search(
		_criteria: CookedDishSearchCriteria,
	): Promise<CookedDishRepositorySearchResult> {
		return this.mockSearch() as CookedDishRepositorySearchResult;
	}

	shouldSearchReturn(result: CookedDishRepositorySearchResult): void {
		this.mockSearch.mockReturnValue(result);
	}

	async searchByRecentSimilarIngredients(
		_ingredientNames: string[],
	): Promise<CookedDish[]> {
		return this.mockSearchByRecentSimilarIngredients() as CookedDish[];
	}

	shouldSearchByRecentSimilarIngredientsReturn(dishes: CookedDish[]): void {
		this.mockSearchByRecentSimilarIngredients.mockReturnValue(dishes);
	}
}
