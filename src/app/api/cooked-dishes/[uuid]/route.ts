import "reflect-metadata";

import { NextRequest, NextResponse } from "next/server";

import { CookedDishByIdSearcher } from "../../../../contexts/dishes/cooked-dishes/application/search-by-id/CookedDishByIdSearcher";
import { CookedDishUpserter } from "../../../../contexts/dishes/cooked-dishes/application/upsert/CookedDishUpserter";
import { container } from "../../../../contexts/shared/infrastructure/dependency-injection/diod.config";
import { HttpNextResponse } from "../../../../contexts/shared/infrastructure/http/HttpNextResponse";

const searcher = container.get(CookedDishByIdSearcher);
const upserter = container.get(CookedDishUpserter);

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ uuid: string }> },
): Promise<NextResponse> {
	const { uuid } = await params;
	const dish = await searcher.search(uuid);

	if (!dish) {
		return HttpNextResponse.notFound();
	}

	return HttpNextResponse.ok(dish);
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ uuid: string }> },
): Promise<NextResponse> {
	const { uuid } = await params;
	const author = request.headers.get("X-Actor-Id")?.trim();

	if (!author) {
		return HttpNextResponse.badRequest("X-Actor-Id header is required");
	}

	const body = await request.json();
	const { name, description, ingredients } = body;

	const result = await upserter.upsert(
		uuid,
		name,
		description,
		ingredients,
		author,
	);

	return result === "created"
		? HttpNextResponse.created()
		: HttpNextResponse.ok({ status: result });
}
