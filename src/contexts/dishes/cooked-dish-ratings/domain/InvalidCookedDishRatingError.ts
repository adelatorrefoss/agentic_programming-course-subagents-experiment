import { CodelyError } from "../../../shared/domain/CodelyError";

export class InvalidCookedDishRatingError extends CodelyError {
	readonly message: string = "InvalidCookedDishRatingError";
}
