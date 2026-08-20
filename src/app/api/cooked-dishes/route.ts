import "reflect-metadata";

import { NextRequest, NextResponse } from "next/server";

import { CookedDishesSearcher } from "../../../contexts/dishes/cooked-dishes/application/search/CookedDishesSearcher";
import { InvalidCookedDishSearchCriteriaError } from "../../../contexts/dishes/cooked-dishes/domain/InvalidCookedDishSearchCriteriaError";
import { container } from "../../../contexts/shared/infrastructure/dependency-injection/diod.config";
import { HttpNextResponse } from "../../../contexts/shared/infrastructure/http/HttpNextResponse";
import { withErrorHandling } from "../../../contexts/shared/infrastructure/http/withErrorHandling";

const searcher = container.get(CookedDishesSearcher);

export const GET = withErrorHandling(
	async (request: NextRequest): Promise<NextResponse> => {
		const params = request.nextUrl.searchParams;
		const result = await searcher.search({
			text: params.get("text") ?? undefined,
			ingredientTypes: params.getAll("ingredientType"),
			minimumRating: params.get("minimumRating") ?? undefined,
			cookedFrom: params.get("cookedFrom") ?? undefined,
			cookedTo: params.get("cookedTo") ?? undefined,
			sortBy: params.get("sortBy") ?? undefined,
			sortDirection: params.get("sortDirection") ?? undefined,
			page: params.get("page") ?? undefined,
			pageSize: params.get("pageSize") ?? undefined,
		});

		return HttpNextResponse.ok(result);
	},
	(error) =>
		error instanceof InvalidCookedDishSearchCriteriaError
			? HttpNextResponse.codelyError(error, 400)
			: undefined,
);
