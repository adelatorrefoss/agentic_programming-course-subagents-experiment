import { Service } from "diod";

import { UuidGenerator } from "../../../../shared/domain/UuidGenerator";
import { CookedDishId } from "../../../cooked-dishes/domain/CookedDishId";
import { CookedDishRepository } from "../../../cooked-dishes/domain/CookedDishRepository";
import { CookedDishNotFoundError } from "../../domain/CookedDishNotFoundError";
import { CookedDishRating } from "../../domain/CookedDishRating";
import { CookedDishRatingAlreadyExistsError } from "../../domain/CookedDishRatingAlreadyExistsError";
import { CookedDishRatingRepository } from "../../domain/CookedDishRatingRepository";

@Service()
export class CookedDishRatingAdder {
	constructor(
		private readonly repository: CookedDishRatingRepository,
		private readonly cookedDishRepository: CookedDishRepository,
		private readonly uuidGenerator: UuidGenerator,
	) {}

	async add(
		cookedDishId: string,
		author: string,
		score: number,
		comment: string | null = null,
	): Promise<void> {
		const dish = await this.cookedDishRepository.searchById(
			new CookedDishId(cookedDishId),
		);

		if (!dish) {
			throw new CookedDishNotFoundError(cookedDishId);
		}

		const ratingId = await this.uuidGenerator.generate();
		const rating = CookedDishRating.create(
			ratingId,
			cookedDishId,
			author,
			score,
			comment,
		);
		const existingRating =
			await this.repository.searchByCookedDishAndAuthor(
				new CookedDishId(cookedDishId),
				rating.author,
			);

		if (existingRating) {
			throw new CookedDishRatingAlreadyExistsError(
				cookedDishId,
				rating.author,
			);
		}

		await this.repository.save(rating);
	}
}
