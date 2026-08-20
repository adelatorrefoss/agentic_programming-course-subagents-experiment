import "reflect-metadata";

import { NextRequest, NextResponse } from "next/server";

import { WeeklyMealPlanCreator } from "../../../contexts/dishes/meal-plans/application/create/WeeklyMealPlanCreator";
import { WeeklyMealPlanByWeekStartSearcher } from "../../../contexts/dishes/meal-plans/application/search-by-week-start/WeeklyMealPlanByWeekStartSearcher";
import { responseForMealPlanError } from "../../../contexts/dishes/meal-plans/infrastructure/http/responseForMealPlanError";
import { container } from "../../../contexts/shared/infrastructure/dependency-injection/diod.config";
import { HttpNextResponse } from "../../../contexts/shared/infrastructure/http/HttpNextResponse";
import { withErrorHandling } from "../../../contexts/shared/infrastructure/http/withErrorHandling";

const creator = container.get(WeeklyMealPlanCreator);
const searcher = container.get(WeeklyMealPlanByWeekStartSearcher);

export const GET = withErrorHandling(
	async (request: NextRequest): Promise<NextResponse> => {
		const weekStart = request.nextUrl.searchParams.get("weekStart") ?? "";
		const plan = await searcher.search(weekStart);

		return plan ? HttpNextResponse.ok(plan) : HttpNextResponse.notFound();
	},
	responseForMealPlanError,
);

export const POST = withErrorHandling(
	async (request: NextRequest): Promise<NextResponse> => {
		const body = await request.json();

		return HttpNextResponse.created(await creator.create(body.weekStart));
	},
	responseForMealPlanError,
);
