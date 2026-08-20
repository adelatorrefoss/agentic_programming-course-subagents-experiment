import { Service } from "diod";

import {
	normalizeMealDay,
	validateMealSlot,
} from "../../domain/WeeklyMealPlan";
import { WeeklyMealPlanNotFoundError } from "../../domain/WeeklyMealPlanErrors";
import { WeeklyMealPlanId } from "../../domain/WeeklyMealPlanId";
import { WeeklyMealPlanRepository } from "../../domain/WeeklyMealPlanRepository";

@Service()
export class WeeklyMealPlanMealRemover {
	constructor(private readonly repository: WeeklyMealPlanRepository) {}

	async remove(
		planId: string,
		day: string | number,
		slot: string,
	): Promise<void> {
		const id = new WeeklyMealPlanId(planId);
		const plan = await this.repository.searchById(id);

		if (!plan) {
			throw new WeeklyMealPlanNotFoundError(planId);
		}

		const normalizedDay = normalizeMealDay(day, plan.weekStart);
		validateMealSlot(slot);
		plan.removeMeal(normalizedDay, slot);

		await this.repository.removeMeal(id, normalizedDay, slot);
	}
}
