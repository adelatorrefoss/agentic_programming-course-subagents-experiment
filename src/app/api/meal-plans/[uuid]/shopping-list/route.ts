import "reflect-metadata";

import { NextRequest, NextResponse } from "next/server";

import { WeeklyMealPlanShoppingListGenerator } from "../../../../../contexts/dishes/meal-plans/application/shopping-list/WeeklyMealPlanShoppingListGenerator";
import { responseForMealPlanError } from "../../../../../contexts/dishes/meal-plans/infrastructure/http/responseForMealPlanError";
import { container } from "../../../../../contexts/shared/infrastructure/dependency-injection/diod.config";
import { HttpNextResponse } from "../../../../../contexts/shared/infrastructure/http/HttpNextResponse";
import { withErrorHandling } from "../../../../../contexts/shared/infrastructure/http/withErrorHandling";

type RouteContext = { params: Promise<{ uuid: string }> };

const generator = container.get(WeeklyMealPlanShoppingListGenerator);

export const GET = withErrorHandling(
	async (
		_request: NextRequest,
		{ params }: RouteContext,
	): Promise<NextResponse> => {
		const { uuid } = await params;

		return HttpNextResponse.ok(await generator.generate(uuid));
	},
	responseForMealPlanError,
);
