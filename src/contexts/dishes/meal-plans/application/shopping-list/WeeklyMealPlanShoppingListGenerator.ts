import { Service } from "diod";

import { CookedDishId } from "../../../cooked-dishes/domain/CookedDishId";
import { CookedDishRepository } from "../../../cooked-dishes/domain/CookedDishRepository";
import { CookedDishNotFoundError } from "../../domain/CookedDishNotFoundError";
import { WeeklyMealPlanNotFoundError } from "../../domain/WeeklyMealPlanErrors";
import { WeeklyMealPlanId } from "../../domain/WeeklyMealPlanId";
import { WeeklyMealPlanRepository } from "../../domain/WeeklyMealPlanRepository";

export type ShoppingListItem = {
	name: string;
	type: string;
	quantity: number;
};

@Service()
export class WeeklyMealPlanShoppingListGenerator {
	constructor(
		private readonly repository: WeeklyMealPlanRepository,
		private readonly cookedDishRepository: CookedDishRepository,
	) {}

	async generate(planId: string): Promise<ShoppingListItem[]> {
		const plan = await this.repository.searchById(
			new WeeklyMealPlanId(planId),
		);

		if (!plan) {
			throw new WeeklyMealPlanNotFoundError(planId);
		}

		const items = new Map<string, ShoppingListItem>();

		const dishes = await Promise.all(
			plan.meals.map(async (meal) => {
				const dish = await this.cookedDishRepository.searchById(
					new CookedDishId(meal.cookedDishId),
				);

				if (!dish) {
					throw new CookedDishNotFoundError(meal.cookedDishId);
				}

				return dish;
			}),
		);

		for (const dish of dishes) {
			for (const ingredient of dish.ingredients) {
				const key = ingredient.name.trim().toLocaleLowerCase();
				const item = items.get(key);

				if (item) {
					item.quantity += 1;
				} else {
					items.set(key, {
						name: ingredient.name,
						type: ingredient.type,
						quantity: 1,
					});
				}
			}
		}

		return [...items.values()];
	}
}
