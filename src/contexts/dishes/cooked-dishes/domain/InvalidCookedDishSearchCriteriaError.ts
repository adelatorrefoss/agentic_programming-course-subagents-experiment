import { CodelyError } from "../../../shared/domain/CodelyError";

export class InvalidCookedDishSearchCriteriaError extends CodelyError {
	override get message(): string {
		return "InvalidCookedDishSearchCriteria";
	}

	constructor(field: string, value: unknown, reason: string) {
		super({ field, value, reason });
	}
}
