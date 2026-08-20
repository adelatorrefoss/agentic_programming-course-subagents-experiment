import { NumberValueObject } from "../../../shared/domain/NumberValueObject";

import { InvalidCookedDishRatingScoreError } from "./InvalidCookedDishRatingScoreError";

export class CookedDishRatingScore extends NumberValueObject {
	constructor(value: number) {
		super(value);

		if (!Number.isInteger(value) || value < 1 || value > 5) {
			throw new InvalidCookedDishRatingScoreError(value);
		}
	}
}
