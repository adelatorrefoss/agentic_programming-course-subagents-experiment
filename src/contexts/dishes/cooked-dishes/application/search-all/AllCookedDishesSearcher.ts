import { Service } from "diod";

import { CookedDishRatingRepository } from "../../../cooked-dish-ratings/domain/CookedDishRatingRepository";
import { CookedDishPrimitives } from "../../domain/CookedDish";
import { CookedDishRepository } from "../../domain/CookedDishRepository";

export interface CookedDishWithRatingSummary extends CookedDishPrimitives {
	ratingSummary: { average: number | null; total: number };
}

@Service()
export class AllCookedDishesSearcher {
	constructor(
		private readonly repository: CookedDishRepository,
		private readonly ratingRepository: CookedDishRatingRepository,
	) {}

	async searchAll(): Promise<CookedDishWithRatingSummary[]> {
		const dishes = await this.repository.searchAll();
		const summaries = await this.ratingRepository.summarizeMany(
			dishes.map((dish) => dish.id),
		);

		return dishes.map((dish) => {
			const summary = summaries.get(dish.id.value);

			return {
				...dish.toPrimitives(),
				ratingSummary: {
					average: summary?.average ?? null,
					total: summary?.total ?? 0,
				},
			};
		});
	}
}
