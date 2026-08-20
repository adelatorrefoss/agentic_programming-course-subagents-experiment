import "reflect-metadata";

import { NextRequest, NextResponse } from "next/server";

import { WeeklyMealPlanCreator } from "../../../contexts/dishes/meal-plans/application/create/WeeklyMealPlanCreator";
import { responseForMealPlanError } from "../../../contexts/dishes/meal-plans/infrastructure/http/responseForMealPlanError";
import { container } from "../../../contexts/shared/infrastructure/dependency-injection/diod.config";
import { HttpNextResponse } from "../../../contexts/shared/infrastructure/http/HttpNextResponse";
import { withErrorHandling } from "../../../contexts/shared/infrastructure/http/withErrorHandling";

const creator = container.get(WeeklyMealPlanCreator);

export const POST = withErrorHandling(
	async (request: NextRequest): Promise<NextResponse> => {
		const body = await request.json();

		return HttpNextResponse.created(await creator.create(body.weekStart));
	},
	responseForMealPlanError,
);
