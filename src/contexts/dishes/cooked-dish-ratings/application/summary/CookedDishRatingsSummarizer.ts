import { Service } from "diod";

import { CookedDishId } from "../../../cooked-dishes/domain/CookedDishId";
import { CookedDishRepository } from "../../../cooked-dishes/domain/CookedDishRepository";
import { CookedDishNotFoundError } from "../../domain/CookedDishNotFoundError";
import {
	CookedDishRatingRepository,
	CookedDishRatingSummary,
} from "../../domain/CookedDishRatingRepository";

@Service()
export class CookedDishRatingsSummarizer {
	constructor(
		private readonly repository: CookedDishRatingRepository,
		private readonly cookedDishRepository: CookedDishRepository,
	) {}

	async summarize(cookedDishId: string): Promise<CookedDishRatingSummary> {
		const dish = await this.cookedDishRepository.searchById(
			new CookedDishId(cookedDishId),
		);

		if (!dish) {
			throw new CookedDishNotFoundError(cookedDishId);
		}

		return this.repository.summarize(new CookedDishId(cookedDishId));
	}
}
