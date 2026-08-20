import { Service } from "diod";
import { Row } from "postgres";

import { EmbeddingsGenerator } from "../../../shared/domain/EmbeddingsGenerator";
import { PostgresConnection } from "../../../shared/infrastructure/postgres/PostgresConnection";
import { PostgresRepository } from "../../../shared/infrastructure/postgres/PostgresRepository";
import { CookedDish } from "../domain/CookedDish";
import { CookedDishId } from "../domain/CookedDishId";
import { CookedDishRepository } from "../domain/CookedDishRepository";
import { CookedDishSearchCriteria } from "../domain/CookedDishSearchCriteria";
import { CookedDishRepositorySearchResult } from "../domain/CookedDishSearchResult";

@Service()
export class PostgresCookedDishRepository
	extends PostgresRepository<CookedDish>
	implements CookedDishRepository
{
	constructor(
		connection: PostgresConnection,
		private readonly embeddingsGenerator: EmbeddingsGenerator,
	) {
		super(connection);
	}

	async save(dish: CookedDish): Promise<void> {
		const primitives = dish.toPrimitives();
		const embedding = await this.generateEmbedding(dish);

		await this.execute`
			INSERT INTO dishes.cooked_dishes (id, name, description, ingredients, embedding)
			VALUES (
				${primitives.id},
				${primitives.name},
				${primitives.description},
				${this.sql.json(primitives.ingredients)},
				${embedding}
			);
		`;
	}

	async searchById(id: CookedDishId): Promise<CookedDish | null> {
		return this.searchOne`
			SELECT id, name, description, ingredients
			FROM dishes.cooked_dishes
			WHERE id = ${id.value};
		`;
	}

	async searchAll(): Promise<CookedDish[]> {
		return this.searchMany`
			SELECT id, name, description, ingredients
			FROM dishes.cooked_dishes
			ORDER BY cooked_at DESC;
		`;
	}

	async search(
		criteria: CookedDishSearchCriteria,
	): Promise<CookedDishRepositorySearchResult> {
		const escapedText = criteria.text
			? `%${this.escapeLikePattern(criteria.text.toLowerCase())}%`
			: null;
		const cookedFrom = criteria.cookedFrom ?? null;
		const cookedTo = criteria.cookedTo ?? null;
		const minimumRating = criteria.minimumRating ?? null;
		const ingredientTypes = criteria.ingredientTypes;
		const ingredientFilter = ingredientTypes.length
			? this.sql`
				EXISTS (
					SELECT 1
					FROM jsonb_array_elements(cd.ingredients) AS ingredient
					WHERE ingredient->>'type' IN ${this.sql(ingredientTypes)}
				)
			`
			: this.sql`TRUE`;
		const orderExpression =
			criteria.sortBy === "name"
				? this.sql`lower(cd.name)`
				: criteria.sortBy === "rating"
					? this.sql`COALESCE(rating.average, 0)`
					: this.sql`cd.cooked_at`;
		const orderDirection =
			criteria.sortDirection === "asc" ? this.sql`ASC` : this.sql`DESC`;

		const where = this.sql`
			(${escapedText}::text IS NULL OR lower(cd.name || ' ' || cd.description) LIKE ${escapedText} ESCAPE ${"\\"})
			AND ${ingredientFilter}
			AND (${minimumRating}::float8 IS NULL OR COALESCE(rating.average, 0) >= ${minimumRating})
			AND (${cookedFrom}::date IS NULL OR cd.cooked_at >= (${cookedFrom}::date AT TIME ZONE 'UTC'))
			AND (${cookedTo}::date IS NULL OR cd.cooked_at < ((${cookedTo}::date + 1) AT TIME ZONE 'UTC'))
		`;

		const [countRows, rows] = await Promise.all([
			this.sql`
				SELECT COUNT(*)::int AS total
				FROM dishes.cooked_dishes cd
				LEFT JOIN LATERAL (
					SELECT AVG(score)::float8 AS average, COUNT(*)::int AS total
					FROM dishes.cooked_dish_ratings
					WHERE cooked_dish_id = cd.id
				) rating ON TRUE
				WHERE ${where};
			`,
			this.sql`
				SELECT
					cd.id,
					cd.name,
					cd.description,
					cd.ingredients,
					cd.cooked_at,
					rating.average,
					rating.total
				FROM dishes.cooked_dishes cd
				LEFT JOIN LATERAL (
					SELECT AVG(score)::float8 AS average, COUNT(*)::int AS total
					FROM dishes.cooked_dish_ratings
					WHERE cooked_dish_id = cd.id
				) rating ON TRUE
				WHERE ${where}
				ORDER BY ${orderExpression} ${orderDirection}, cd.id ASC
				LIMIT ${criteria.pageSize}
				OFFSET ${criteria.offset};
			`,
		]);

		return {
			items: rows.map((row) => ({
				id: row.id as string,
				name: row.name as string,
				description: row.description as string,
				ingredients: row.ingredients as {
					name: string;
					type: string;
				}[],
				cookedAt: new Date(
					row.cooked_at as string | Date,
				).toISOString(),
				ratingSummary: {
					average: row.average === null ? null : Number(row.average),
					total: Number(row.total),
				},
			})),
			totalItems: Number(countRows[0].total),
		};
	}

	async searchByRecentSimilarIngredients(
		ingredientNames: string[],
	): Promise<CookedDish[]> {
		const queryText = `Ingredients: ${ingredientNames.join(", ")}`;
		const embedding = await this.embeddingsGenerator.embed(queryText);
		const embeddingJson = JSON.stringify(embedding);

		return this.searchMany`
			SELECT id, name, description, ingredients
			FROM dishes.cooked_dishes
			WHERE cooked_at >= NOW() - INTERVAL '1 month'
			ORDER BY embedding <=> ${embeddingJson}::vector
			LIMIT 5;
		`;
	}

	protected toAggregate(row: Row): CookedDish {
		return CookedDish.fromPrimitives({
			id: row.id as string,
			name: row.name as string,
			description: row.description as string,
			ingredients: row.ingredients as { name: string; type: string }[],
		});
	}

	private async generateEmbedding(dish: CookedDish): Promise<string> {
		const text = this.formatDishForEmbedding(dish);
		const vector = await this.embeddingsGenerator.embed(text);

		return JSON.stringify(vector);
	}

	private formatDishForEmbedding(dish: CookedDish): string {
		const ingredients = dish.ingredients.map((i) => i.name).join(", ");

		return `Name: ${dish.name}|Description: ${dish.description}|Ingredients: ${ingredients}`;
	}

	private escapeLikePattern(value: string): string {
		return value
			.replaceAll("\\", "\\\\")
			.replaceAll("%", "\\%")
			.replaceAll("_", "\\_");
	}
}
