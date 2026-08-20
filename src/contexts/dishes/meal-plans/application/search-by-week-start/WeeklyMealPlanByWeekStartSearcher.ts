import { Service } from "diod";

import {
	validateWeeklyMealPlanWeekStart,
	WeeklyMealPlanPrimitives,
} from "../../domain/WeeklyMealPlan";
import { WeeklyMealPlanRepository } from "../../domain/WeeklyMealPlanRepository";

@Service()
export class WeeklyMealPlanByWeekStartSearcher {
	constructor(private readonly repository: WeeklyMealPlanRepository) {}

	async search(weekStart: string): Promise<WeeklyMealPlanPrimitives | null> {
		validateWeeklyMealPlanWeekStart(weekStart);
		const plan = await this.repository.searchByWeekStart(weekStart);

		return plan?.toPrimitives() ?? null;
	}
}
