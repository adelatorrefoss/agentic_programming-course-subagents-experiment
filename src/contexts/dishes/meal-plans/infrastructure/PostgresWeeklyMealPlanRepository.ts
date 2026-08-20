import { Service } from "diod";
import { Row } from "postgres";

import { PostgresConnection } from "../../../shared/infrastructure/postgres/PostgresConnection";
import { PostgresRepository } from "../../../shared/infrastructure/postgres/PostgresRepository";
import { CookedDishNotFoundError } from "../domain/CookedDishNotFoundError";
import {
	WeeklyMealPlan,
	WeeklyMealPlanPrimitives,
	WeeklyMealPrimitives,
} from "../domain/WeeklyMealPlan";
import {
	WeeklyMealPlanAlreadyExistsError,
	WeeklyMealPlanSlotAlreadyOccupiedError,
} from "../domain/WeeklyMealPlanErrors";
import { WeeklyMealPlanId } from "../domain/WeeklyMealPlanId";
import { WeeklyMealPlanRepository } from "../domain/WeeklyMealPlanRepository";

/* eslint-disable no-await-in-loop */

@Service()
export class PostgresWeeklyMealPlanRepository
	extends PostgresRepository<WeeklyMealPlan>
	implements WeeklyMealPlanRepository
{
	// The explicit constructor is required so DIOD can resolve the inherited repository dependency.
	// eslint-disable-next-line @typescript-eslint/no-useless-constructor
	constructor(connection: PostgresConnection) {
		super(connection);
	}

	async save(plan: WeeklyMealPlan): Promise<void> {
		const primitives = plan.toPrimitives();

		try {
			await this.execute`
				INSERT INTO dishes.weekly_meal_plans (id, week_start, created_at)
				VALUES (${primitives.id}, ${primitives.weekStart}, NOW());
			`;
		} catch (error: unknown) {
			if (this.hasPostgresCode(error, "23505")) {
				throw new WeeklyMealPlanAlreadyExistsError(
					primitives.weekStart,
				);
			}

			throw error;
		}

		for (const meal of primitives.meals) {
			try {
				await this.execute`
					INSERT INTO dishes.weekly_meals
						(weekly_meal_plan_id, day, slot, cooked_dish_id, created_at)
					VALUES (
						${primitives.id},
						${meal.day},
						${meal.slot},
						${meal.cookedDishId},
						NOW()
					)
					ON CONFLICT (weekly_meal_plan_id, day, slot)
					DO UPDATE SET cooked_dish_id = EXCLUDED.cooked_dish_id;
				`;
			} catch (error: unknown) {
				if (this.hasPostgresCode(error, "23503")) {
					throw new CookedDishNotFoundError(meal.cookedDishId);
				}

				throw error;
			}
		}
	}

	async searchById(id: WeeklyMealPlanId): Promise<WeeklyMealPlan | null> {
		const rows = await this.sql`
			SELECT id, week_start
			FROM dishes.weekly_meal_plans
			WHERE id = ${id.value};
		`;

		if (!rows.length) {
			return null;
		}

		const meals = await this.sql`
			SELECT day, slot, cooked_dish_id
			FROM dishes.weekly_meals
			WHERE weekly_meal_plan_id = ${id.value}
			ORDER BY day, slot;
		`;

		return WeeklyMealPlan.fromPrimitives({
			id: rows[0].id as string,
			weekStart: this.dateToString(rows[0].week_start),
			meals: meals.map((meal) => ({
				day: this.dateToString(meal.day),
				slot: meal.slot as WeeklyMealPrimitives["slot"],
				cookedDishId: meal.cooked_dish_id as string,
			})),
		});
	}

	async searchByWeekStart(weekStart: string): Promise<WeeklyMealPlan | null> {
		const rows = await this.sql`
			SELECT id, week_start
			FROM dishes.weekly_meal_plans
			WHERE week_start = ${weekStart};
		`;

		if (!rows.length) {
			return null;
		}

		return this.searchById(new WeeklyMealPlanId(rows[0].id as string));
	}

	async assignMeal(
		planId: WeeklyMealPlanId,
		meal: WeeklyMealPrimitives,
	): Promise<void> {
		try {
			await this.execute`
				INSERT INTO dishes.weekly_meals
					(weekly_meal_plan_id, day, slot, cooked_dish_id, created_at)
				VALUES (
					${planId.value},
					${meal.day},
					${meal.slot},
					${meal.cookedDishId},
					NOW()
				);
			`;
		} catch (error: unknown) {
			if (this.hasPostgresCode(error, "23505")) {
				throw new WeeklyMealPlanSlotAlreadyOccupiedError(
					planId.value,
					meal.day,
					meal.slot,
				);
			}

			if (this.hasPostgresCode(error, "23503")) {
				throw new CookedDishNotFoundError(meal.cookedDishId);
			}

			throw error;
		}
	}

	async replaceMeal(
		planId: WeeklyMealPlanId,
		meal: WeeklyMealPrimitives,
	): Promise<void> {
		try {
			await this.execute`
				INSERT INTO dishes.weekly_meals
					(weekly_meal_plan_id, day, slot, cooked_dish_id, created_at)
				VALUES (
					${planId.value},
					${meal.day},
					${meal.slot},
					${meal.cookedDishId},
					NOW()
				)
				ON CONFLICT (weekly_meal_plan_id, day, slot)
				DO UPDATE SET cooked_dish_id = EXCLUDED.cooked_dish_id;
			`;
		} catch (error: unknown) {
			if (this.hasPostgresCode(error, "23503")) {
				throw new CookedDishNotFoundError(meal.cookedDishId);
			}

			throw error;
		}
	}

	async removeMeal(
		planId: WeeklyMealPlanId,
		day: string,
		slot: string,
	): Promise<void> {
		await this.execute`
			DELETE FROM dishes.weekly_meals
			WHERE weekly_meal_plan_id = ${planId.value}
				AND day = ${day}
				AND slot = ${slot};
		`;
	}

	protected toAggregate(row: Row): WeeklyMealPlan {
		const primitives =
			row as unknown as Partial<WeeklyMealPlanPrimitives> & {
				week_start: string | Date;
				meals?: WeeklyMealPrimitives[];
			};

		return WeeklyMealPlan.fromPrimitives({
			id: String(row.id),
			weekStart: this.dateToString(primitives.week_start),
			meals: primitives.meals ?? [],
		});
	}

	private dateToString(value: unknown): string {
		if (value instanceof Date) {
			return value.toISOString().slice(0, 10);
		}

		return String(value).slice(0, 10);
	}

	private hasPostgresCode(error: unknown, code: string): boolean {
		return (
			typeof error === "object" &&
			error !== null &&
			"code" in error &&
			error.code === code
		);
	}
}
