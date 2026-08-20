import { WeeklyMealPlanMealAssigner } from "../../../../../src/contexts/dishes/meal-plans/application/assign-meal/WeeklyMealPlanMealAssigner";
import { WeeklyMealPlanCreator } from "../../../../../src/contexts/dishes/meal-plans/application/create/WeeklyMealPlanCreator";
import { WeeklyMealPlanMealRemover } from "../../../../../src/contexts/dishes/meal-plans/application/remove-meal/WeeklyMealPlanMealRemover";
import { WeeklyMealPlanMealReplacer } from "../../../../../src/contexts/dishes/meal-plans/application/replace-meal/WeeklyMealPlanMealReplacer";
import { WeeklyMealPlanSearcher } from "../../../../../src/contexts/dishes/meal-plans/application/search-by-id/WeeklyMealPlanSearcher";
import { WeeklyMealPlanShoppingListGenerator } from "../../../../../src/contexts/dishes/meal-plans/application/shopping-list/WeeklyMealPlanShoppingListGenerator";
import { CookedDishNotFoundError } from "../../../../../src/contexts/dishes/meal-plans/domain/CookedDishNotFoundError";
import { InvalidWeeklyMealPlanSlotError } from "../../../../../src/contexts/dishes/meal-plans/domain/InvalidWeeklyMealPlanSlotError";
import { WeeklyMealPlanAlreadyExistsError } from "../../../../../src/contexts/dishes/meal-plans/domain/WeeklyMealPlanAlreadyExistsError";
import { WeeklyMealPlanNotFoundError } from "../../../../../src/contexts/dishes/meal-plans/domain/WeeklyMealPlanNotFoundError";
import { WeeklyMealPlanSlotAlreadyOccupiedError } from "../../../../../src/contexts/dishes/meal-plans/domain/WeeklyMealPlanSlotAlreadyOccupiedError";
import { CookedDishMother } from "../../../dishes/cooked-dishes/domain/CookedDishMother";
import { MockUuidGenerator } from "../../../shared/domain/MockUuidGenerator";
import { WeeklyMealPlanMother } from "../domain/WeeklyMealPlanMother";
import { MockCookedDishRepository } from "../infrastructure/MockCookedDishRepository";
import { MockWeeklyMealPlanRepository } from "../infrastructure/MockWeeklyMealPlanRepository";

describe("Weekly meal plan use cases should", () => {
	let plans: MockWeeklyMealPlanRepository;
	let dishes: MockCookedDishRepository;

	beforeEach(() => {
		plans = new MockWeeklyMealPlanRepository();
		dishes = new MockCookedDishRepository();
	});

	it("create a plan and reject a duplicated week", async () => {
		const plan = WeeklyMealPlanMother.create();
		const uuidGenerator = new MockUuidGenerator();
		const creator = new WeeklyMealPlanCreator(plans, uuidGenerator);
		uuidGenerator.shouldGenerate(plan.id.value);
		plans.shouldSave(plan);

		await expect(creator.create(plan.weekStart)).resolves.toEqual(
			plan.toPrimitives(),
		);

		plans.shouldSearchByWeekStartReturn(plan);
		await expect(creator.create(plan.weekStart)).rejects.toBeInstanceOf(
			WeeklyMealPlanAlreadyExistsError,
		);
	});

	it("search a plan and return null when it does not exist", async () => {
		const plan = WeeklyMealPlanMother.create();
		const searcher = new WeeklyMealPlanSearcher(plans);
		plans.shouldSearchByIdReturn(plan);

		await expect(searcher.search(plan.id.value)).resolves.toEqual(
			plan.toPrimitives(),
		);

		plans.shouldSearchByIdReturn(null);
		await expect(searcher.search(plan.id.value)).resolves.toBeNull();
	});

	it("assign a dish and fail when the plan or dish does not exist", async () => {
		const plan = WeeklyMealPlanMother.create();
		const dish = CookedDishMother.create();
		const assigner = new WeeklyMealPlanMealAssigner(plans, dishes);
		plans.shouldSearchByIdReturn(plan);
		dishes.shouldSearchByIdReturn(dish);
		plans.shouldAssignMeal();

		await assigner.assign(
			plan.id.value,
			WeeklyMealPlanMother.monday(),
			"breakfast",
			dish.id.value,
		);

		plans.shouldSearchByIdReturn(null);
		await expect(
			assigner.assign(
				plan.id.value,
				WeeklyMealPlanMother.monday(),
				"lunch",
				dish.id.value,
			),
		).rejects.toBeInstanceOf(WeeklyMealPlanNotFoundError);

		plans.shouldSearchByIdReturn(plan);
		dishes.shouldSearchByIdReturn(null);
		await expect(
			assigner.assign(
				plan.id.value,
				WeeklyMealPlanMother.monday(),
				"lunch",
				dish.id.value,
			),
		).rejects.toBeInstanceOf(CookedDishNotFoundError);
	});

	it("reject invalid and occupied slots through the assign use case", async () => {
		const plan = WeeklyMealPlanMother.create({
			meals: [WeeklyMealPlanMother.assignment({ slot: "lunch" })],
		});
		const dish = CookedDishMother.create();
		const assigner = new WeeklyMealPlanMealAssigner(plans, dishes);
		plans.shouldSearchByIdReturn(plan);
		dishes.shouldSearchByIdReturn(dish);

		await expect(
			assigner.assign(
				plan.id.value,
				WeeklyMealPlanMother.monday(),
				"brunch",
				dish.id.value,
			),
		).rejects.toBeInstanceOf(InvalidWeeklyMealPlanSlotError);

		await expect(
			assigner.assign(
				plan.id.value,
				WeeklyMealPlanMother.monday(),
				"lunch",
				dish.id.value,
			),
		).rejects.toBeInstanceOf(WeeklyMealPlanSlotAlreadyOccupiedError);
	});

	it("replace and remove a dish", async () => {
		const first = CookedDishMother.create({ id: "dish-1" });
		const second = CookedDishMother.create({ id: "dish-2" });
		const plan = WeeklyMealPlanMother.create({
			meals: [
				WeeklyMealPlanMother.assignment({
					cookedDishId: first.id.value,
					slot: "dinner",
				}),
			],
		});
		const replacer = new WeeklyMealPlanMealReplacer(plans, dishes);
		const remover = new WeeklyMealPlanMealRemover(plans);
		plans.shouldSearchByIdReturn(plan);
		dishes.shouldSearchByIdReturn(second);
		plans.shouldReplaceMeal();

		await replacer.replace(
			plan.id.value,
			WeeklyMealPlanMother.monday(),
			"dinner",
			second.id.value,
		);

		plans.shouldSearchByIdReturn(plan);
		plans.shouldRemoveMeal();
		await remover.remove(
			plan.id.value,
			WeeklyMealPlanMother.monday(),
			"dinner",
		);
	});

	it("return a consolidated shopping list and fail for a missing plan", async () => {
		const first = CookedDishMother.create({
			id: "dish-1",
			ingredients: [{ name: "Onion", type: "main" }],
		});
		const second = CookedDishMother.create({
			id: "dish-2",
			ingredients: [{ name: "onion", type: "main" }],
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
		const searcher = new WeeklyMealPlanShoppingListGenerator(plans, dishes);
		plans.shouldSearchByIdReturn(plan);
		dishes.shouldSearchByIdReturnFor(first.id.value, first);
		dishes.shouldSearchByIdReturnFor(second.id.value, second);

		await expect(searcher.generate(plan.id.value)).resolves.toEqual([
			{ name: "Onion", type: "main", quantity: 2 },
		]);

		plans.shouldSearchByIdReturn(null);
		await expect(searcher.generate(plan.id.value)).rejects.toBeInstanceOf(
			WeeklyMealPlanNotFoundError,
		);
	});
});
