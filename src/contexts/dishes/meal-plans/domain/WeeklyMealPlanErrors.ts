import { CodelyError } from "../../../shared/domain/CodelyError";

export class WeeklyMealPlanNotFoundError extends CodelyError {
	readonly message = "WeeklyMealPlanNotFoundError";

	constructor(readonly weeklyMealPlanId: string) {
		super({ weeklyMealPlanId });
	}
}

export class WeeklyMealPlanAlreadyExistsError extends CodelyError {
	readonly message = "WeeklyMealPlanAlreadyExistsError";

	constructor(readonly weekStart: string) {
		super({ weekStart });
	}
}

export class InvalidWeeklyMealPlanWeekStartError extends CodelyError {
	readonly message = "InvalidWeeklyMealPlanWeekStartError";

	constructor(readonly weekStart: string) {
		super({ weekStart });
	}
}

export class InvalidWeeklyMealPlanSlotError extends CodelyError {
	readonly message = "InvalidWeeklyMealPlanSlotError";

	constructor(readonly slot: string) {
		super({ slot });
	}
}

export class WeeklyMealPlanSlotAlreadyOccupiedError extends CodelyError {
	readonly message = "WeeklyMealPlanSlotAlreadyOccupiedError";

	constructor(
		readonly weeklyMealPlanId: string,
		readonly day: string,
		readonly slot: string,
	) {
		super({ weeklyMealPlanId, day, slot });
	}
}
