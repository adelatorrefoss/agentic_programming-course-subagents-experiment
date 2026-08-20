import "reflect-metadata";

import { PostgresCookedDishRepository } from "../../../../../src/contexts/dishes/cooked-dishes/infrastructure/PostgresCookedDishRepository";
import { WeeklyMealPlanMealAssigner } from "../../../../../src/contexts/dishes/meal-plans/application/assign-meal/WeeklyMealPlanMealAssigner";
import { WeeklyMealPlanMealRemover } from "../../../../../src/contexts/dishes/meal-plans/application/remove-meal/WeeklyMealPlanMealRemover";
import { WeeklyMealPlanMealReplacer } from "../../../../../src/contexts/dishes/meal-plans/application/replace-meal/WeeklyMealPlanMealReplacer";
import { WeeklyMealPlanShoppingListGenerator } from "../../../../../src/contexts/dishes/meal-plans/application/shopping-list/WeeklyMealPlanShoppingListGenerator";
import { WeeklyMealPlanAlreadyExistsError } from "../../../../../src/contexts/dishes/meal-plans/domain/WeeklyMealPlanAlreadyExistsError";
import { WeeklyMealPlanSlotAlreadyOccupiedError } from "../../../../../src/contexts/dishes/meal-plans/domain/WeeklyMealPlanSlotAlreadyOccupiedError";
import { PostgresWeeklyMealPlanRepository } from "../../../../../src/contexts/dishes/meal-plans/infrastructure/PostgresWeeklyMealPlanRepository";
import { PostgresConnection } from "../../../../../src/contexts/shared/infrastructure/postgres/PostgresConnection";
import { CookedDishMother } from "../../../dishes/cooked-dishes/domain/CookedDishMother";
import { WeeklyMealPlanMother } from "../domain/WeeklyMealPlanMother";

const connection = new PostgresConnection(
	"localhost",
	5432,
	"supabase_admin",
	"c0d3ly7v",
	"postgres",
);
const planRepository = new PostgresWeeklyMealPlanRepository(connection);
const dishRepository = new PostgresCookedDishRepository(connection);

async function insertCookedDish(
	dish: ReturnType<typeof CookedDishMother.create>,
): Promise<void> {
	await connection.sql`
		INSERT INTO dishes.cooked_dishes
			(id, name, description, ingredients, embedding)
		VALUES (
			${dish.id.value},
			${dish.name},
			${dish.description},
			${connection.sql.json(dish.toPrimitives().ingredients)},
			${JSON.stringify(new Array(1024).fill(0))}::vector
		);
	`;
}

describe("PostgresWeeklyMealPlanRepository should", () => {
	beforeEach(async () => {
		await connection.truncateAll();
	});

	afterAll(async () => {
		await connection.end();
	});

	it("persist and search a weekly meal plan and its meals", async () => {
		const plan = WeeklyMealPlanMother.create();
		const dish = CookedDishMother.create();
		await insertCookedDish(dish);
		await planRepository.save(plan);

		await new WeeklyMealPlanMealAssigner(
			planRepository,
			dishRepository,
		).assign(
			plan.id.value,
			WeeklyMealPlanMother.monday(),
			"breakfast",
			dish.id.value,
		);

		await expect(planRepository.searchById(plan.id)).resolves.toEqual(
			expect.objectContaining({
				id: plan.id,
				weekStart: plan.weekStart,
				meals: [
					{
						day: WeeklyMealPlanMother.monday(),
						slot: "breakfast",
						cookedDishId: dish.id.value,
					},
				],
			}),
		);
	});

	it("enforce one plan per week", async () => {
		const first = WeeklyMealPlanMother.create();
		const second = WeeklyMealPlanMother.create({
			weekStart: first.weekStart,
		});

		await planRepository.save(first);

		await expect(planRepository.save(second)).rejects.toBeInstanceOf(
			WeeklyMealPlanAlreadyExistsError,
		);
	});

	it("allow only one concurrent assignment to the same slot", async () => {
		const plan = WeeklyMealPlanMother.create();
		await planRepository.save(plan);
		const firstDish = CookedDishMother.create();
		const secondDish = CookedDishMother.create();
		await insertCookedDish(firstDish);
		await insertCookedDish(secondDish);
		const assigner = new WeeklyMealPlanMealAssigner(
			planRepository,
			dishRepository,
		);

		const results = await Promise.allSettled([
			assigner.assign(
				plan.id.value,
				WeeklyMealPlanMother.monday(),
				"lunch",
				firstDish.id.value,
			),
			assigner.assign(
				plan.id.value,
				WeeklyMealPlanMother.monday(),
				"lunch",
				secondDish.id.value,
			),
		]);

		expect(
			results.filter((result) => result.status === "fulfilled"),
		).toHaveLength(1);
		expect(
			results.filter((result) => result.status === "rejected"),
		).toHaveLength(1);
		expect(
			(
				results.find(
					(result) => result.status === "rejected",
				) as PromiseRejectedResult
			).reason,
		).toBeInstanceOf(WeeklyMealPlanSlotAlreadyOccupiedError);
	});

	it("replace and remove an assignment", async () => {
		const firstDish = CookedDishMother.create();
		const secondDish = CookedDishMother.create();
		await insertCookedDish(firstDish);
		await insertCookedDish(secondDish);
		const plan = WeeklyMealPlanMother.create();
		await planRepository.save(plan);
		const assigner = new WeeklyMealPlanMealAssigner(
			planRepository,
			dishRepository,
		);
		await assigner.assign(
			plan.id.value,
			WeeklyMealPlanMother.monday(),
			"dinner",
			firstDish.id.value,
		);

		await new WeeklyMealPlanMealReplacer(
			planRepository,
			dishRepository,
		).replace(
			plan.id.value,
			WeeklyMealPlanMother.monday(),
			"dinner",
			secondDish.id.value,
		);
		expect((await planRepository.searchById(plan.id))?.meals).toEqual([
			expect.objectContaining({ cookedDishId: secondDish.id.value }),
		]);

		await new WeeklyMealPlanMealRemover(planRepository).remove(
			plan.id.value,
			WeeklyMealPlanMother.monday(),
			"dinner",
		);
		expect((await planRepository.searchById(plan.id))?.meals).toEqual([]);
	});

	it("return a consolidated shopping list with repeated ingredients", async () => {
		const firstDish = CookedDishMother.create({
			ingredients: [
				{ name: "Rice", type: "main" },
				{ name: "Salt", type: "household_staple" },
			],
		});
		const secondDish = CookedDishMother.create({
			ingredients: [
				{ name: "rice", type: "main" },
				{ name: "salt", type: "household_staple" },
			],
		});
		await insertCookedDish(firstDish);
		await insertCookedDish(secondDish);
		const plan = WeeklyMealPlanMother.create();
		await planRepository.save(plan);
		const assigner = new WeeklyMealPlanMealAssigner(
			planRepository,
			dishRepository,
		);
		await assigner.assign(
			plan.id.value,
			WeeklyMealPlanMother.monday(),
			"breakfast",
			firstDish.id.value,
		);
		await assigner.assign(
			plan.id.value,
			WeeklyMealPlanMother.monday(),
			"dinner",
			secondDish.id.value,
		);

		const searcher = new WeeklyMealPlanShoppingListGenerator(
			planRepository,
			dishRepository,
		);

		await expect(searcher.generate(plan.id.value)).resolves.toEqual([
			{ name: "Rice", type: "main", quantity: 2 },
			{ name: "Salt", type: "household_staple", quantity: 2 },
		]);
	});
});
