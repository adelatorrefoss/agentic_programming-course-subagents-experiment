import { AggregateRoot } from "../../../shared/domain/AggregateRoot";
import { CookedDishId } from "../../cooked-dishes/domain/CookedDishId";

import { CookedDishRatingId } from "./CookedDishRatingId";
import { CookedDishRatingScore } from "./CookedDishRatingScore";
import { InvalidCookedDishRatingError } from "./InvalidCookedDishRatingError";

export interface CookedDishRatingPrimitives {
	id: string;
	cookedDishId: string;
	author: string;
	score: number;
	comment: string | null;
	createdAt: Date;
}

export class CookedDishRating extends AggregateRoot {
	private constructor(
		readonly id: CookedDishRatingId,
		readonly cookedDishId: CookedDishId,
		readonly author: string,
		readonly score: CookedDishRatingScore,
		readonly comment: string | null,
		readonly createdAt: Date,
	) {
		super();
	}

	static create(
		id: string,
		cookedDishId: string,
		author: string,
		score: number,
		comment: string | null = null,
		createdAt: Date = new Date(),
	): CookedDishRating {
		if (!id || !cookedDishId || !(createdAt instanceof Date)) {
			throw new InvalidCookedDishRatingError({
				id,
				cookedDishId,
				createdAt,
			});
		}

		if (Number.isNaN(createdAt.getTime())) {
			throw new InvalidCookedDishRatingError({ createdAt });
		}

		if (comment !== null && typeof comment !== "string") {
			throw new InvalidCookedDishRatingError({ comment });
		}

		const normalizedAuthor = CookedDishRating.normalizeAuthor(author);

		return new CookedDishRating(
			new CookedDishRatingId(id),
			new CookedDishId(cookedDishId),
			normalizedAuthor,
			new CookedDishRatingScore(score),
			comment,
			createdAt,
		);
	}

	static fromPrimitives(
		primitives: CookedDishRatingPrimitives,
	): CookedDishRating {
		return CookedDishRating.create(
			primitives.id,
			primitives.cookedDishId,
			primitives.author,
			primitives.score,
			primitives.comment,
			primitives.createdAt,
		);
	}

	private static normalizeAuthor(author: string): string {
		if (typeof author !== "string" || author.trim() === "") {
			throw new InvalidCookedDishRatingError({ author });
		}

		return author.trim();
	}

	toPrimitives(): CookedDishRatingPrimitives {
		return {
			id: this.id.value,
			cookedDishId: this.cookedDishId.value,
			author: this.author,
			score: this.score.value,
			comment: this.comment,
			createdAt: this.createdAt,
		};
	}
}
