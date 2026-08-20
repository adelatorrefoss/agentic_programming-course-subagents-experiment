import { InvalidCookedDishRatingError } from "./InvalidCookedDishRatingError";

export class InvalidCookedDishRatingScoreError extends InvalidCookedDishRatingError {
	readonly message = "InvalidCookedDishRatingScoreError";

	constructor(readonly score: unknown) {
		super({ score });
	}
}
