import "reflect-metadata";

import { CookedDishNotFoundError } from "../../../../../src/contexts/dishes/cooked-dish-ratings/domain/CookedDishNotFoundError";
import { CookedDishRatingAlreadyExistsError } from "../../../../../src/contexts/dishes/cooked-dish-ratings/domain/CookedDishRatingAlreadyExistsError";
import { PostgresCookedDishRatingRepository } from "../../../../../src/contexts/dishes/cooked-dish-ratings/infrastructure/PostgresCookedDishRatingRepository";
import { PostgresConnection } from "../../../../../src/contexts/shared/infrastructure/postgres/PostgresConnection";
import { CookedDishMother } from "../../cooked-dishes/domain/CookedDishMother";
import { CookedDishRatingMother } from "../domain/CookedDishRatingMother";

const connection = new PostgresConnection(
	"localhost",
	5432,
	"supabase_admin",
	"c0d3ly7v",
	"postgres",
);
const repository = new PostgresCookedDishRatingRepository(connection);

async function insertCookedDish(
	dish: ReturnType<typeof CookedDishMother.create>,
): Promise<void> {
	const embedding = JSON.stringify(new Array(1024).fill(0));

	await connection.sql`
		INSERT INTO dishes.cooked_dishes
			(id, name, description, ingredients, embedding)
		VALUES (
			${dish.id.value},
			${dish.name},
			${dish.description},
			${connection.sql.json(dish.toPrimitives().ingredients)},
			${embedding}::vector
		);
	`;
}

describe("PostgresCookedDishRatingRepository should", () => {
	beforeEach(async () => {
		await connection.truncateAll();
	});

	afterAll(async () => {
		await connection.end();
	});

	it("persist and search a rating", async () => {
		const dish = CookedDishMother.create();
		const rating = CookedDishRatingMother.create({
			cookedDishId: dish.id.value,
		});
		await insertCookedDish(dish);

		await repository.save(rating);

		const result = await repository.searchByCookedDishAndAuthor(
			dish.id,
			rating.author,
		);

		expect(result?.toPrimitives()).toEqual(rating.toPrimitives());
	});

	it("reject a duplicated rating by cooked dish and author", async () => {
		const dish = CookedDishMother.create();
		const rating = CookedDishRatingMother.create({
			cookedDishId: dish.id.value,
			author: "same author",
		});
		await insertCookedDish(dish);
		await repository.save(rating);

		await expect(
			repository.save(
				CookedDishRatingMother.create({
					cookedDishId: dish.id.value,
					author: rating.author,
				}),
			),
		).rejects.toBeInstanceOf(CookedDishRatingAlreadyExistsError);
	});

	it("reject a rating for a non-existent cooked dish", async () => {
		const dish = CookedDishMother.create();
		const rating = CookedDishRatingMother.create({
			cookedDishId: dish.id.value,
		});

		await expect(repository.save(rating)).rejects.toBeInstanceOf(
			CookedDishNotFoundError,
		);
	});

	it("return average, total and score distribution", async () => {
		const dish = CookedDishMother.create();
		await insertCookedDish(dish);

		await Promise.all(
			[1, 3, 3, 5].map((score, index) =>
				repository.save(
					CookedDishRatingMother.create({
						cookedDishId: dish.id.value,
						author: `author-${index}`,
						score,
					}),
				),
			),
		);

		await expect(repository.summarize(dish.id)).resolves.toEqual({
			average: 3,
			total: 4,
			distribution: { 1: 1, 2: 0, 3: 2, 4: 0, 5: 1 },
		});
	});

	it("return an empty summary when the cooked dish has no ratings", async () => {
		const dish = CookedDishMother.create();
		await insertCookedDish(dish);

		await expect(repository.summarize(dish.id)).resolves.toEqual({
			average: 0,
			total: 0,
			distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
		});
	});

	it("summarize ratings for several cooked dishes in one batch", async () => {
		const ratedDish = CookedDishMother.create();
		const unratedDish = CookedDishMother.create();
		await insertCookedDish(ratedDish);
		await insertCookedDish(unratedDish);
		await repository.save(
			CookedDishRatingMother.create({
				cookedDishId: ratedDish.id.value,
				score: 4,
			}),
		);

		const summaries = await repository.summarizeMany([
			ratedDish.id,
			unratedDish.id,
		]);

		expect(summaries.get(ratedDish.id.value)).toEqual({
			average: 4,
			total: 1,
			distribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 0 },
		});
		expect(summaries.has(unratedDish.id.value)).toBe(false);
	});
});
