import { Service } from "diod";
import { Row } from "postgres";

import { PostgresConnection } from "../../../shared/infrastructure/postgres/PostgresConnection";
import { PostgresRepository } from "../../../shared/infrastructure/postgres/PostgresRepository";
import { CookedDishId } from "../../cooked-dishes/domain/CookedDishId";
import { CookedDishNotFoundError } from "../domain/CookedDishNotFoundError";
import { CookedDishRating } from "../domain/CookedDishRating";
import { CookedDishRatingAlreadyExistsError } from "../domain/CookedDishRatingAlreadyExistsError";
import {
	CookedDishRatingDistribution,
	CookedDishRatingRepository,
	CookedDishRatingSummary,
} from "../domain/CookedDishRatingRepository";

@Service()
export class PostgresCookedDishRatingRepository
	extends PostgresRepository<CookedDishRating>
	implements CookedDishRatingRepository
{
	// The explicit constructor is required so DIOD can resolve the inherited repository dependency.
	// eslint-disable-next-line @typescript-eslint/no-useless-constructor
	constructor(connection: PostgresConnection) {
		super(connection);
	}

	async save(rating: CookedDishRating): Promise<void> {
		const primitives = rating.toPrimitives();

		try {
			await this.execute`
				INSERT INTO dishes.cooked_dish_ratings
					(id, cooked_dish_id, author, score, comment, created_at)
				VALUES (
					${primitives.id},
					${primitives.cookedDishId},
					${primitives.author},
					${primitives.score},
					${primitives.comment},
					${primitives.createdAt}
				);
			`;
		} catch (error: unknown) {
			if (this.isUniqueViolation(error)) {
				throw new CookedDishRatingAlreadyExistsError(
					primitives.cookedDishId,
					primitives.author,
				);
			}

			if (this.isForeignKeyViolation(error)) {
				throw new CookedDishNotFoundError(primitives.cookedDishId);
			}

			throw error;
		}
	}

	async searchByCookedDishAndAuthor(
		cookedDishId: CookedDishId,
		author: string,
	): Promise<CookedDishRating | null> {
		return this.searchOne`
			SELECT id, cooked_dish_id, author, score, comment, created_at
			FROM dishes.cooked_dish_ratings
			WHERE cooked_dish_id = ${cookedDishId.value}
				AND author = ${author};
		`;
	}

	async summarize(
		cookedDishId: CookedDishId,
	): Promise<CookedDishRatingSummary> {
		const [row] = await this.sql`
			SELECT
				COALESCE(AVG(score), 0)::float8 AS average,
				COUNT(*)::int AS total,
				COUNT(*) FILTER (WHERE score = 1)::int AS score_1,
				COUNT(*) FILTER (WHERE score = 2)::int AS score_2,
				COUNT(*) FILTER (WHERE score = 3)::int AS score_3,
				COUNT(*) FILTER (WHERE score = 4)::int AS score_4,
				COUNT(*) FILTER (WHERE score = 5)::int AS score_5
			FROM dishes.cooked_dish_ratings
			WHERE cooked_dish_id = ${cookedDishId.value};
		`;

		const distribution: CookedDishRatingDistribution = {
			1: Number(row.score_1),
			2: Number(row.score_2),
			3: Number(row.score_3),
			4: Number(row.score_4),
			5: Number(row.score_5),
		};

		return {
			average: Number(row.average),
			total: Number(row.total),
			distribution,
		};
	}

	async summarizeMany(
		cookedDishIds: CookedDishId[],
	): Promise<Map<string, CookedDishRatingSummary>> {
		if (cookedDishIds.length === 0) {
			return new Map();
		}

		const rows = await this.sql`
			SELECT
				cooked_dish_id,
				AVG(score)::float8 AS average,
				COUNT(*)::int AS total,
				COUNT(*) FILTER (WHERE score = 1)::int AS score_1,
				COUNT(*) FILTER (WHERE score = 2)::int AS score_2,
				COUNT(*) FILTER (WHERE score = 3)::int AS score_3,
				COUNT(*) FILTER (WHERE score = 4)::int AS score_4,
				COUNT(*) FILTER (WHERE score = 5)::int AS score_5
			FROM dishes.cooked_dish_ratings
			WHERE cooked_dish_id IN ${this.sql(cookedDishIds.map((id) => id.value))}
			GROUP BY cooked_dish_id;
		`;

		return new Map(
			rows.map((row) => [
				row.cooked_dish_id as string,
				{
					average: Number(row.average),
					total: Number(row.total),
					distribution: {
						1: Number(row.score_1),
						2: Number(row.score_2),
						3: Number(row.score_3),
						4: Number(row.score_4),
						5: Number(row.score_5),
					},
				},
			]),
		);
	}

	protected toAggregate(row: Row): CookedDishRating {
		return CookedDishRating.fromPrimitives({
			id: row.id as string,
			cookedDishId: row.cooked_dish_id as string,
			author: row.author as string,
			score: Number(row.score),
			comment: row.comment as string | null,
			createdAt: new Date(row.created_at as string | number | Date),
		});
	}

	private isUniqueViolation(error: unknown): boolean {
		return this.hasPostgresCode(error, "23505");
	}

	private isForeignKeyViolation(error: unknown): boolean {
		return this.hasPostgresCode(error, "23503");
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
