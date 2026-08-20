import { WeeklyMealPlan, WeeklyMealPrimitives } from "./WeeklyMealPlan";
import { WeeklyMealPlanId } from "./WeeklyMealPlanId";

export abstract class WeeklyMealPlanRepository {
	abstract save(plan: WeeklyMealPlan): Promise<void>;

	abstract searchById(id: WeeklyMealPlanId): Promise<WeeklyMealPlan | null>;

	abstract searchByWeekStart(
		weekStart: string,
	): Promise<WeeklyMealPlan | null>;

	abstract assignMeal(
		planId: WeeklyMealPlanId,
		meal: WeeklyMealPrimitives,
	): Promise<void>;

	abstract replaceMeal(
		planId: WeeklyMealPlanId,
		meal: WeeklyMealPrimitives,
	): Promise<void>;

	abstract removeMeal(
		planId: WeeklyMealPlanId,
		day: string,
		slot: string,
	): Promise<void>;
}
