import "reflect-metadata";

import { CookedDishSearchCriteria } from "../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDishSearchCriteria";
import { PostgresCookedDishRepository } from "../../../../../src/contexts/dishes/cooked-dishes/infrastructure/PostgresCookedDishRepository";
import { container } from "../../../../../src/contexts/shared/infrastructure/dependency-injection/diod.config";
import { PostgresConnection } from "../../../../../src/contexts/shared/infrastructure/postgres/PostgresConnection";
import { CookedDishMother } from "../domain/CookedDishMother";

const connection = container.get(PostgresConnection);
const repository = container.get(PostgresCookedDishRepository);

describe("PostgresCookedDishRepository should", () => {
	beforeEach(async () => {
		await connection.truncateAll();
	});

	afterAll(async () => {
		await connection.end();
	});

	it("save a cooked dish", async () => {
		const dish = CookedDishMother.create();

		await repository.save(dish);
	});

	it("search all cooked dishes", async () => {
		const dish1 = CookedDishMother.create();
		const dish2 = CookedDishMother.create();

		await repository.save(dish1);
		await repository.save(dish2);

		const result = await repository.searchAll();

		expect(result).toHaveLength(2);
		expect(result.map((d) => d.toPrimitives())).toEqual(
			expect.arrayContaining([
				dish1.toPrimitives(),
				dish2.toPrimitives(),
			]),
		);
	});

	it("return empty array when no dishes exist", async () => {
		const result = await repository.searchAll();

		expect(result).toEqual([]);
	});

	it("apply literal text and ingredient-type filters alone and combined", async () => {
		const matchingMain = CookedDishMother.create({
			name: "Chef's 100%_ Tomato Bowl",
			description: "Fresh lunch",
			ingredients: [{ name: "tomato", type: "main" }],
		});
		const matchingStaple = CookedDishMother.create({
			name: "Rice",
			description: "A chef's 100%_ pantry dish",
			ingredients: [{ name: "rice", type: "household_staple" }],
		});
		const wildcardOnly = CookedDishMother.create({
			name: "100xx Tomato Bowl",
			description: "Would match unescaped wildcards",
			ingredients: [{ name: "tomato", type: "main" }],
		});
		await repository.save(matchingMain);
		await repository.save(matchingStaple);
		await repository.save(wildcardOnly);

		const result = await repository.search(
			CookedDishSearchCriteria.create({
				text: "chef's 100%_",
				ingredientTypes: ["main", "household_staple"],
			}),
		);
		const textOnly = await repository.search(
			CookedDishSearchCriteria.create({ text: "chef's 100%_" }),
		);
		const mainsOnly = await repository.search(
			CookedDishSearchCriteria.create({ ingredientTypes: ["main"] }),
		);
		const staplesOnly = await repository.search(
			CookedDishSearchCriteria.create({
				ingredientTypes: ["household_staple"],
			}),
		);

		expect(result.items.map((item) => item.id)).toEqual(
			expect.arrayContaining([
				matchingMain.id.value,
				matchingStaple.id.value,
			]),
		);
		expect(textOnly.items.map((item) => item.id)).toEqual(
			expect.arrayContaining([
				matchingMain.id.value,
				matchingStaple.id.value,
			]),
		);
		expect(mainsOnly.items.map((item) => item.id)).toEqual(
			expect.arrayContaining([
				matchingMain.id.value,
				wildcardOnly.id.value,
			]),
		);
		expect(staplesOnly.items.map((item) => item.id)).toEqual([
			matchingStaple.id.value,
		]);
	});

	it("filter ratings while preserving null for unrated dishes", async () => {
		const highlyRated = CookedDishMother.create({ name: "Highly rated" });
		const unrated = CookedDishMother.create({ name: "Unrated" });
		await repository.save(highlyRated);
		await repository.save(unrated);
		await connection.sql`
			INSERT INTO dishes.cooked_dish_ratings
				(id, cooked_dish_id, author, score, created_at)
			VALUES
				('00000000-0000-4000-8000-000000000101', ${highlyRated.id.value}, 'one', 4, NOW()),
				('00000000-0000-4000-8000-000000000102', ${highlyRated.id.value}, 'two', 5, NOW());
		`;

		const all = await repository.search(
			CookedDishSearchCriteria.create({ sortBy: "rating" }),
		);
		const filtered = await repository.search(
			CookedDishSearchCriteria.create({ minimumRating: 4.5 }),
		);

		expect(
			all.items.find((item) => item.id === unrated.id.value)
				?.ratingSummary,
		).toEqual({
			average: null,
			total: 0,
		});
		expect(filtered.items).toHaveLength(1);
		expect(filtered.items[0].ratingSummary).toEqual({
			average: 4.5,
			total: 2,
		});
	});

	it("apply inclusive date bounds and every allow-listed sort direction", async () => {
		const first = CookedDishMother.create({
			id: "00000000-0000-4000-8000-000000000011",
			name: "Zulu",
		});
		const second = CookedDishMother.create({
			id: "00000000-0000-4000-8000-000000000012",
			name: "Alpha",
		});
		const outside = CookedDishMother.create({ name: "Outside" });
		await repository.save(first);
		await repository.save(second);
		await repository.save(outside);
		await connection.sql`
			UPDATE dishes.cooked_dishes
			SET cooked_at = CASE id
				WHEN ${first.id.value} THEN '2026-08-10T00:00:00Z'::timestamptz
				WHEN ${second.id.value} THEN '2026-08-10T23:59:59Z'::timestamptz
				ELSE '2026-08-11T00:00:00Z'::timestamptz
			END;
		`;

		const sortedResults = await Promise.all(
			(["cookedAt", "name", "rating"] as const).flatMap((sortBy) =>
				(["asc", "desc"] as const).map((sortDirection) =>
					repository.search(
						CookedDishSearchCriteria.create({
							cookedFrom: "2026-08-10",
							cookedTo: "2026-08-10",
							sortBy,
							sortDirection,
						}),
					),
				),
			),
		);

		for (const result of sortedResults) {
			expect(result.totalItems).toBe(2);
			expect(result.items.map((item) => item.id)).not.toContain(
				outside.id.value,
			);
		}

		const byName = await repository.search(
			CookedDishSearchCriteria.create({
				sortBy: "name",
				sortDirection: "asc",
			}),
		);
		expect(byName.items.slice(0, 2).map((item) => item.name)).toEqual([
			"Alpha",
			"Outside",
		]);
	});

	it("return the correct total for an empty out-of-range page and stable ties", async () => {
		const first = CookedDishMother.create({
			id: "00000000-0000-4000-8000-000000000001",
			name: "Same",
		});
		const second = CookedDishMother.create({
			id: "00000000-0000-4000-8000-000000000002",
			name: "Same",
		});
		await repository.save(second);
		await repository.save(first);

		const firstPage = await repository.search(
			CookedDishSearchCriteria.create({
				sortBy: "name",
				sortDirection: "asc",
				pageSize: 1,
			}),
		);
		const emptyPage = await repository.search(
			CookedDishSearchCriteria.create({ page: 3, pageSize: 1 }),
		);

		expect(firstPage.items[0].id).toBe(first.id.value);
		expect(emptyPage.items).toEqual([]);
		expect(emptyPage.totalItems).toBe(2);
	});

	it("search dishes by similar ingredients sorted by similarity", async () => {
		const dish1 = CookedDishMother.create({
			name: "Pasta Carbonara",
			ingredients: [
				{ name: "pasta", type: "main" },
				{ name: "bacon", type: "main" },
				{ name: "egg", type: "main" },
			],
		});
		const dish2 = CookedDishMother.create({
			name: "Caesar Salad",
			ingredients: [
				{ name: "lettuce", type: "main" },
				{ name: "chicken", type: "main" },
				{ name: "parmesan", type: "main" },
			],
		});

		await repository.save(dish1);
		await repository.save(dish2);

		const result = await repository.searchByRecentSimilarIngredients([
			"pasta",
			"egg",
		]);

		expect(result).toEqual([dish1, dish2]);
	});

	it("return empty array when searching by ingredients with no dishes", async () => {
		const result = await repository.searchByRecentSimilarIngredients([
			"tomato",
		]);

		expect(result).toEqual([]);
	});

	it("exclude dishes cooked more than a month ago", async () => {
		const recentDish = CookedDishMother.create({
			name: "Fresh Pasta",
			ingredients: [
				{ name: "pasta", type: "main" },
				{ name: "tomato", type: "main" },
			],
		});
		const oldDish = CookedDishMother.create({
			name: "Old Pasta",
			ingredients: [
				{ name: "pasta", type: "main" },
				{ name: "basil", type: "main" },
			],
		});

		await repository.save(recentDish);
		await repository.save(oldDish);

		await connection.sql`
			UPDATE dishes.cooked_dishes
			SET cooked_at = NOW() - INTERVAL '2 months'
			WHERE id = ${oldDish.id.value}
		`;

		const result = await repository.searchByRecentSimilarIngredients([
			"pasta",
		]);

		expect(result).toEqual([recentDish]);
	});
});
