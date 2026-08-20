import { NextResponse } from "next/server";

import { CodelyError } from "../../../../shared/domain/CodelyError";
import { HttpNextResponse } from "../../../../shared/infrastructure/http/HttpNextResponse";
import { CookedDishNotFoundError } from "../../domain/CookedDishNotFoundError";
import {
	InvalidWeeklyMealPlanSlotError,
	InvalidWeeklyMealPlanWeekStartError,
	WeeklyMealPlanAlreadyExistsError,
	WeeklyMealPlanNotFoundError,
	WeeklyMealPlanSlotAlreadyOccupiedError,
} from "../../domain/WeeklyMealPlanErrors";

export function responseForMealPlanError(
	error: CodelyError,
): NextResponse | void {
	if (
		error instanceof WeeklyMealPlanNotFoundError ||
		error instanceof CookedDishNotFoundError
	) {
		return HttpNextResponse.codelyError(error, 404);
	}

	if (
		error instanceof InvalidWeeklyMealPlanSlotError ||
		error instanceof InvalidWeeklyMealPlanWeekStartError
	) {
		return HttpNextResponse.codelyError(error, 400);
	}

	if (
		error instanceof WeeklyMealPlanAlreadyExistsError ||
		error instanceof WeeklyMealPlanSlotAlreadyOccupiedError
	) {
		return HttpNextResponse.codelyError(error, 409);
	}
}
