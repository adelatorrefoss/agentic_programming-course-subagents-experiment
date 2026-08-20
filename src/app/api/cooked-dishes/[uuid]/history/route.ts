import "reflect-metadata";

import { NextRequest, NextResponse } from "next/server";

import { CookedDishHistorySearcher } from "../../../../../contexts/dishes/cooked-dish-history/application/search/CookedDishHistorySearcher";
import { CookedDishNotFoundError } from "../../../../../contexts/dishes/cooked-dishes/domain/CookedDishNotFoundError";
import { container } from "../../../../../contexts/shared/infrastructure/dependency-injection/diod.config";
import { HttpNextResponse } from "../../../../../contexts/shared/infrastructure/http/HttpNextResponse";
import { withErrorHandling } from "../../../../../contexts/shared/infrastructure/http/withErrorHandling";

const searcher = container.get(CookedDishHistorySearcher);

export const GET = withErrorHandling<
	CookedDishNotFoundError,
	{
		params: Promise<{ uuid: string }>;
	}
>(
	async (_request: NextRequest, { params }): Promise<NextResponse> => {
		const { uuid } = await params;
		const items = await searcher.search(uuid);

		return HttpNextResponse.ok({ items });
	},
	(error) =>
		error instanceof CookedDishNotFoundError
			? HttpNextResponse.notFound()
			: undefined,
);
