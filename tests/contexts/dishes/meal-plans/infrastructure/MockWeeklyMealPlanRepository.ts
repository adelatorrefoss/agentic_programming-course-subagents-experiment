import {
	WeeklyMealPlan,
	WeeklyMealPrimitives,
} from "../../../../../src/contexts/dishes/meal-plans/domain/WeeklyMealPlan";
import { WeeklyMealPlanId } from "../../../../../src/contexts/dishes/meal-plans/domain/WeeklyMealPlanId";
import { WeeklyMealPlanRepository } from "../../../../../src/contexts/dishes/meal-plans/domain/WeeklyMealPlanRepository";

export class MockWeeklyMealPlanRepository implements WeeklyMealPlanRepository {
	private readonly mockSave = jest.fn();
	private readonly mockSearchById = jest.fn();
	private readonly mockSearchByWeekStart = jest.fn();
	private readonly mockAssignMeal = jest.fn();
	private readonly mockReplaceMeal = jest.fn();
	private readonly mockRemoveMeal = jest.fn();

	async save(plan: WeeklyMealPlan): Promise<void> {
		expect(this.mockSave).toHaveBeenCalledWith(plan.toPrimitives());
	}

	shouldSave(plan: WeeklyMealPlan): void {
		this.mockSave(plan.toPrimitives());
	}

	async searchById(id: WeeklyMealPlanId): Promise<WeeklyMealPlan | null> {
		return this.mockSearchById(id) as WeeklyMealPlan | null;
	}

	shouldSearchByIdReturn(plan: WeeklyMealPlan | null): void {
		this.mockSearchById.mockReturnValue(plan);
	}

	async searchByWeekStart(weekStart: string): Promise<WeeklyMealPlan | null> {
		return this.mockSearchByWeekStart(weekStart) as WeeklyMealPlan | null;
	}

	shouldSearchByWeekStartReturn(plan: WeeklyMealPlan | null): void {
		this.mockSearchByWeekStart.mockReturnValue(plan);
	}

	async assignMeal(
		planId: WeeklyMealPlanId,
		meal: WeeklyMealPrimitives,
	): Promise<void> {
		this.mockAssignMeal(planId, meal);
	}

	shouldAssignMeal(): void {
		this.mockAssignMeal();
	}

	async replaceMeal(
		planId: WeeklyMealPlanId,
		meal: WeeklyMealPrimitives,
	): Promise<void> {
		this.mockReplaceMeal(planId, meal);
	}

	shouldReplaceMeal(): void {
		this.mockReplaceMeal();
	}

	async removeMeal(
		planId: WeeklyMealPlanId,
		day: string,
		slot: string,
	): Promise<void> {
		this.mockRemoveMeal(planId, day, slot);
	}

	shouldRemoveMeal(): void {
		this.mockRemoveMeal();
	}
}
