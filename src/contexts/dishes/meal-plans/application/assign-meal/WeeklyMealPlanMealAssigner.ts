import { Service } from "diod";

import { CookedDishId } from "../../../cooked-dishes/domain/CookedDishId";
import { CookedDishRepository } from "../../../cooked-dishes/domain/CookedDishRepository";
import { CookedDishNotFoundError } from "../../domain/CookedDishNotFoundError";
import { WeeklyMealPlanNotFoundError } from "../../domain/WeeklyMealPlanErrors";
import { WeeklyMealPlanId } from "../../domain/WeeklyMealPlanId";
import { WeeklyMealPlanRepository } from "../../domain/WeeklyMealPlanRepository";

@Service()
export class WeeklyMealPlanMealAssigner {
	constructor(
		private readonly repository: WeeklyMealPlanRepository,
		private readonly cookedDishRepository: CookedDishRepository,
	) {}

	async assign(
		planId: string,
		day: string | number,
		slot: string,
		cookedDishId: string,
	): Promise<void> {
		const id = new WeeklyMealPlanId(planId);
		const plan = await this.repository.searchById(id);

		if (!plan) {
			throw new WeeklyMealPlanNotFoundError(planId);
		}

		const dish = await this.cookedDishRepository.searchById(
			new CookedDishId(cookedDishId),
		);

		if (!dish) {
			throw new CookedDishNotFoundError(cookedDishId);
		}

		const meal = plan.assignMeal(day, slot, cookedDishId);

		await this.repository.assignMeal(id, meal);
	}
}
