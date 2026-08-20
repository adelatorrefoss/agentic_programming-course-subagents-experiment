import { CookedDishId } from "../../cooked-dishes/domain/CookedDishId";

import { CookedDishRating } from "./CookedDishRating";

export type CookedDishRatingDistribution = {
	1: number;
	2: number;
	3: number;
	4: number;
	5: number;
};

export interface CookedDishRatingSummary {
	average: number;
	total: number;
	distribution: CookedDishRatingDistribution;
}

export abstract class CookedDishRatingRepository {
	abstract save(rating: CookedDishRating): Promise<void>;

	abstract searchByCookedDishAndAuthor(
		cookedDishId: CookedDishId,
		author: string,
	): Promise<CookedDishRating | null>;

	abstract summarize(
		cookedDishId: CookedDishId,
	): Promise<CookedDishRatingSummary>;

	abstract summarizeMany(
		cookedDishIds: CookedDishId[],
	): Promise<Map<string, CookedDishRatingSummary>>;
}
