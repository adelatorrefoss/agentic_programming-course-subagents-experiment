import "reflect-metadata";

import { NextRequest, NextResponse } from "next/server";

import { WeeklyMealPlanSearcher } from "../../../../contexts/dishes/meal-plans/application/search-by-id/WeeklyMealPlanSearcher";
import { responseForMealPlanError } from "../../../../contexts/dishes/meal-plans/infrastructure/http/responseForMealPlanError";
import { container } from "../../../../contexts/shared/infrastructure/dependency-injection/diod.config";
import { HttpNextResponse } from "../../../../contexts/shared/infrastructure/http/HttpNextResponse";
import { withErrorHandling } from "../../../../contexts/shared/infrastructure/http/withErrorHandling";

type RouteContext = { params: Promise<{ uuid: string }> };

const searcher = container.get(WeeklyMealPlanSearcher);

export const GET = withErrorHandling(
	async (
		_request: NextRequest,
		{ params }: RouteContext,
	): Promise<NextResponse> => {
		const { uuid } = await params;
		const plan = await searcher.search(uuid);

		if (!plan) {
			return HttpNextResponse.notFound();
		}

		return HttpNextResponse.ok(plan);
	},
	responseForMealPlanError,
);
