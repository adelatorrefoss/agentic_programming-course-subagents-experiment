import { Service } from "diod";

import { WeeklyMealPlanPrimitives } from "../../domain/WeeklyMealPlan";
import { WeeklyMealPlanId } from "../../domain/WeeklyMealPlanId";
import { WeeklyMealPlanRepository } from "../../domain/WeeklyMealPlanRepository";

@Service()
export class WeeklyMealPlanSearcher {
	constructor(private readonly repository: WeeklyMealPlanRepository) {}

	async search(id: string): Promise<WeeklyMealPlanPrimitives | null> {
		const plan = await this.repository.searchById(new WeeklyMealPlanId(id));

		return plan?.toPrimitives() ?? null;
	}
}
