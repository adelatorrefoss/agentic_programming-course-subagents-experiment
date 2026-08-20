import { CodelyError } from "../../../shared/domain/CodelyError";

export class CookedDishNotFoundError extends CodelyError {
	readonly message = "CookedDishNotFoundError";

	constructor(readonly cookedDishId: string) {
		super({ cookedDishId });
	}
}
