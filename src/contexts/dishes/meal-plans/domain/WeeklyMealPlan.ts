import { AggregateRoot } from "../../../shared/domain/AggregateRoot";

import {
	InvalidWeeklyMealPlanSlotError,
	InvalidWeeklyMealPlanWeekStartError,
	WeeklyMealPlanSlotAlreadyOccupiedError,
} from "./WeeklyMealPlanErrors";
import { WeeklyMealPlanId } from "./WeeklyMealPlanId";

export type MealSlot = "breakfast" | "lunch" | "dinner";
export type MealDay = string;

export type WeeklyMealPrimitives = {
	day: MealDay;
	slot: MealSlot;
	cookedDishId: string;
};

export type WeeklyMealPlanPrimitives = {
	id: string;
	weekStart: string;
	meals: WeeklyMealPrimitives[];
};

const SLOTS: readonly MealSlot[] = ["breakfast", "lunch", "dinner"];

function parseDate(date: string): Date | null {
	if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		return null;
	}

	const parsed = new Date(`${date}T00:00:00.000Z`);

	return Number.isNaN(parsed.getTime()) ||
		parsed.toISOString().slice(0, 10) !== date
		? null
		: parsed;
}

export function normalizeMealDay(
	day: string | number,
	weekStart: string,
): MealDay {
	const start = parseDate(weekStart);

	if (!start) {
		throw new InvalidWeeklyMealPlanWeekStartError(weekStart);
	}

	let parsedDay: Date | null = null;

	if (
		typeof day === "number" &&
		Number.isInteger(day) &&
		day >= 0 &&
		day <= 6
	) {
		parsedDay = new Date(start.getTime() + day * 24 * 60 * 60 * 1000);
	} else if (typeof day === "string") {
		parsedDay = parseDate(day);
	}

	if (!parsedDay) {
		throw new InvalidWeeklyMealPlanWeekStartError(String(day));
	}

	const offset = Math.round(
		(parsedDay.getTime() - start.getTime()) / (24 * 60 * 60 * 1000),
	);

	if (offset < 0 || offset > 6) {
		throw new InvalidWeeklyMealPlanWeekStartError(String(day));
	}

	return parsedDay.toISOString().slice(0, 10);
}

export function validateMealSlot(slot: string): asserts slot is MealSlot {
	if (!SLOTS.includes(slot as MealSlot)) {
		throw new InvalidWeeklyMealPlanSlotError(slot);
	}
}

export function validateWeeklyMealPlanWeekStart(weekStart: string): void {
	const parsed = parseDate(weekStart);

	if (!parsed || parsed.getUTCDay() !== 1) {
		throw new InvalidWeeklyMealPlanWeekStartError(weekStart);
	}
}

export class WeeklyMealPlan extends AggregateRoot {
	private constructor(
		readonly id: WeeklyMealPlanId,
		readonly weekStart: string,
		private readonly assignedMeals: WeeklyMealPrimitives[],
	) {
		super();
		validateWeeklyMealPlanWeekStart(weekStart);
	}

	static create(id: string, weekStart: string): WeeklyMealPlan {
		return new WeeklyMealPlan(new WeeklyMealPlanId(id), weekStart, []);
	}

	static fromPrimitives(
		primitives: WeeklyMealPlanPrimitives,
	): WeeklyMealPlan {
		const plan = new WeeklyMealPlan(
			new WeeklyMealPlanId(primitives.id),
			primitives.weekStart,
			[],
		);

		for (const meal of primitives.meals) {
			plan.addLoadedMeal(meal);
		}

		return plan;
	}

	get meals(): WeeklyMealPrimitives[] {
		return this.assignedMeals.map((meal) => ({ ...meal }));
	}

	assignMeal(
		day: string | number,
		slot: string,
		cookedDishId: string,
	): WeeklyMealPrimitives {
		const normalizedDay = normalizeMealDay(day, this.weekStart);
		validateMealSlot(slot);

		if (
			this.assignedMeals.some(
				(meal) => meal.day === normalizedDay && meal.slot === slot,
			)
		) {
			throw new WeeklyMealPlanSlotAlreadyOccupiedError(
				this.id.value,
				normalizedDay,
				slot,
			);
		}

		const meal: WeeklyMealPrimitives = {
			day: normalizedDay,
			slot,
			cookedDishId,
		};
		this.assignedMeals.push(meal);

		return { ...meal };
	}

	replaceMeal(
		day: string | number,
		slot: string,
		cookedDishId: string,
	): WeeklyMealPrimitives {
		const normalizedDay = normalizeMealDay(day, this.weekStart);
		validateMealSlot(slot);
		const index = this.assignedMeals.findIndex(
			(meal) => meal.day === normalizedDay && meal.slot === slot,
		);
		const meal: WeeklyMealPrimitives = {
			day: normalizedDay,
			slot,
			cookedDishId,
		};

		if (index === -1) {
			this.assignedMeals.push(meal);
		} else {
			this.assignedMeals[index] = meal;
		}

		return { ...meal };
	}

	removeMeal(day: string | number, slot: string): void {
		const normalizedDay = normalizeMealDay(day, this.weekStart);
		validateMealSlot(slot);
		const index = this.assignedMeals.findIndex(
			(meal) => meal.day === normalizedDay && meal.slot === slot,
		);

		if (index !== -1) {
			this.assignedMeals.splice(index, 1);
		}
	}

	toPrimitives(): WeeklyMealPlanPrimitives {
		return {
			id: this.id.value,
			weekStart: this.weekStart,
			meals: this.meals,
		};
	}

	private addLoadedMeal(meal: WeeklyMealPrimitives): void {
		const normalizedDay = normalizeMealDay(meal.day, this.weekStart);
		validateMealSlot(meal.slot);

		if (
			this.assignedMeals.some(
				(existing) =>
					existing.day === normalizedDay &&
					existing.slot === meal.slot,
			)
		) {
			throw new WeeklyMealPlanSlotAlreadyOccupiedError(
				this.id.value,
				normalizedDay,
				meal.slot,
			);
		}

		this.assignedMeals.push({
			day: normalizedDay,
			slot: meal.slot,
			cookedDishId: meal.cookedDishId,
		});
	}
}
