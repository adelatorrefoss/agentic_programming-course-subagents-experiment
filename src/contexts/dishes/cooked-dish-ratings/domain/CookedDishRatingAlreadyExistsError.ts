import { CodelyError } from "../../../shared/domain/CodelyError";

export class CookedDishRatingAlreadyExistsError extends CodelyError {
	readonly message = "CookedDishRatingAlreadyExistsError";

	constructor(
		readonly cookedDishId: string,
		readonly author: string,
	) {
		super({ cookedDishId, author });
	}
}
