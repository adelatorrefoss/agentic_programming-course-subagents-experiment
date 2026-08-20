import { InvalidWeeklyMealPlanSlotError } from "../../../../../src/contexts/dishes/meal-plans/domain/InvalidWeeklyMealPlanSlotError";
import { InvalidWeeklyMealPlanWeekStartError } from "../../../../../src/contexts/dishes/meal-plans/domain/InvalidWeeklyMealPlanWeekStartError";
import { WeeklyMealPlanSlotAlreadyOccupiedError } from "../../../../../src/contexts/dishes/meal-plans/domain/WeeklyMealPlanSlotAlreadyOccupiedError";
import { CookedDishMother } from "../../../dishes/cooked-dishes/domain/CookedDishMother";

import { WeeklyMealPlanMother } from "./WeeklyMealPlanMother";

describe("WeeklyMealPlan should", () => {
	it("only accept a week starting on Monday", () => {
		expect(() =>
			WeeklyMealPlanMother.create({ weekStart: "2026-08-18" }),
		).toThrow(InvalidWeeklyMealPlanWeekStartError);
	});

	it.each(["brunch", "", "BREAKFAST"])(
		"reject an invalid slot: %s",
		(slot) => {
			const plan = WeeklyMealPlanMother.create();

			expect(() =>
				plan.assignMeal(
					WeeklyMealPlanMother.monday(),
					slot as never,
					"cooked-dish-id",
				),
			).toThrow(InvalidWeeklyMealPlanSlotError);
		},
	);

	it("reject a day outside the selected week", () => {
		const plan = WeeklyMealPlanMother.create();

		expect(() =>
			plan.assignMeal("2026-08-24", "lunch", "cooked-dish-id"),
		).toThrow(InvalidWeeklyMealPlanWeekStartError);
	});

	it("assign a dish to an empty slot", () => {
		const plan = WeeklyMealPlanMother.create();
		const meal = WeeklyMealPlanMother.assignment({
			cookedDishId: "dish-1",
			slot: "breakfast",
		});

		plan.assignMeal(meal.day, meal.slot, meal.cookedDishId);

		expect(plan.toPrimitives().meals).toContainEqual(meal);
	});

	it("reject duplicate assignments to the same day and slot", () => {
		const plan = WeeklyMealPlanMother.create({
			meals: [
				WeeklyMealPlanMother.assignment({
					cookedDishId: "dish-1",
					slot: "dinner",
				}),
			],
		});

		expect(() =>
			plan.assignMeal(WeeklyMealPlanMother.monday(), "dinner", "dish-2"),
		).toThrow(WeeklyMealPlanSlotAlreadyOccupiedError);
	});

	it("replace an occupied slot", () => {
		const plan = WeeklyMealPlanMother.create({
			meals: [
				WeeklyMealPlanMother.assignment({
					cookedDishId: "dish-1",
					slot: "lunch",
				}),
			],
		});

		plan.replaceMeal(WeeklyMealPlanMother.monday(), "lunch", "dish-2");

		expect(plan.toPrimitives().meals).toEqual([
			expect.objectContaining({ slot: "lunch", cookedDishId: "dish-2" }),
		]);
	});

	it("remove an assignment", () => {
		const meal = WeeklyMealPlanMother.assignment({
			cookedDishId: "dish-1",
			slot: "breakfast",
		});
		const plan = WeeklyMealPlanMother.create({ meals: [meal] });

		plan.removeMeal(meal.day, meal.slot);

		expect(plan.toPrimitives().meals).toEqual([]);
	});

	it("keep meal ingredients available to the shopping-list use case", () => {
		const first = CookedDishMother.create({
			id: "dish-1",
			ingredients: [{ name: "Tomato", type: "main" }],
		});
		const second = CookedDishMother.create({
			id: "dish-2",
			ingredients: [{ name: "tomato", type: "main" }],
		});
		const plan = WeeklyMealPlanMother.create({
			meals: [
				WeeklyMealPlanMother.assignment({
					cookedDishId: first.id.value,
				}),
				WeeklyMealPlanMother.assignment({
					cookedDishId: second.id.value,
					slot: "dinner",
				}),
			],
		});

		expect(plan.meals.map((meal) => meal.cookedDishId)).toEqual([
			first.id.value,
			second.id.value,
		]);
	});
});
