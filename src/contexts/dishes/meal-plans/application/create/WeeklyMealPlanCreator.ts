import { Service } from "diod";

import { UuidGenerator } from "../../../../shared/domain/UuidGenerator";
import {
	validateWeeklyMealPlanWeekStart,
	WeeklyMealPlan,
} from "../../domain/WeeklyMealPlan";
import { WeeklyMealPlanAlreadyExistsError } from "../../domain/WeeklyMealPlanErrors";
import { WeeklyMealPlanRepository } from "../../domain/WeeklyMealPlanRepository";

@Service()
export class WeeklyMealPlanCreator {
	constructor(
		private readonly repository: WeeklyMealPlanRepository,
		private readonly uuidGenerator: UuidGenerator,
	) {}

	async create(
		weekStart: string,
	): Promise<ReturnType<WeeklyMealPlan["toPrimitives"]>> {
		validateWeeklyMealPlanWeekStart(weekStart);

		const existingPlan = await this.repository.searchByWeekStart(weekStart);

		if (existingPlan) {
			throw new WeeklyMealPlanAlreadyExistsError(weekStart);
		}

		const plan = WeeklyMealPlan.create(
			await this.uuidGenerator.generate(),
			weekStart,
		);

		await this.repository.save(plan);

		return plan.toPrimitives();
	}
}
