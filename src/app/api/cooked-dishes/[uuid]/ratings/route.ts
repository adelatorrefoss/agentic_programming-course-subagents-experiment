import "reflect-metadata";

import { NextRequest, NextResponse } from "next/server";

import { CookedDishRatingAdder } from "../../../../../contexts/dishes/cooked-dish-ratings/application/add/CookedDishRatingAdder";
import { CookedDishRatingsSummarizer } from "../../../../../contexts/dishes/cooked-dish-ratings/application/summary/CookedDishRatingsSummarizer";
import { CookedDishNotFoundError } from "../../../../../contexts/dishes/cooked-dish-ratings/domain/CookedDishNotFoundError";
import { CookedDishRatingAlreadyExistsError } from "../../../../../contexts/dishes/cooked-dish-ratings/domain/CookedDishRatingAlreadyExistsError";
import { InvalidCookedDishRatingError } from "../../../../../contexts/dishes/cooked-dish-ratings/domain/InvalidCookedDishRatingError";
import { CodelyError } from "../../../../../contexts/shared/domain/CodelyError";
import { container } from "../../../../../contexts/shared/infrastructure/dependency-injection/diod.config";
import { HttpNextResponse } from "../../../../../contexts/shared/infrastructure/http/HttpNextResponse";
import { withErrorHandling } from "../../../../../contexts/shared/infrastructure/http/withErrorHandling";

type RouteContext = {
	params: Promise<{ uuid: string }>;
};

type AddRatingRequest = {
	author: string;
	score: number;
	comment: string | null;
};

const adder = container.get(CookedDishRatingAdder);
const summarizer = container.get(CookedDishRatingsSummarizer);

async function addRatingRequest(
	request: NextRequest,
): Promise<AddRatingRequest> {
	let body: unknown;

	try {
		body = await request.json();
	} catch {
		throw new InvalidCookedDishRatingError({ body: "Invalid JSON" });
	}

	if (typeof body !== "object" || body === null || Array.isArray(body)) {
		throw new InvalidCookedDishRatingError({ body });
	}

	const values = body as Record<string, unknown>;
	const comment = values.comment ?? null;

	if (
		typeof values.author !== "string" ||
		typeof values.score !== "number" ||
		(comment !== null && typeof comment !== "string")
	) {
		throw new InvalidCookedDishRatingError({ body });
	}

	return { author: values.author, score: values.score, comment };
}

function responseForError(error: CodelyError): NextResponse | void {
	if (error instanceof CookedDishNotFoundError) {
		return HttpNextResponse.codelyError(error, 404);
	}

	if (error instanceof CookedDishRatingAlreadyExistsError) {
		return HttpNextResponse.codelyError(error, 409);
	}

	if (error instanceof InvalidCookedDishRatingError) {
		return HttpNextResponse.codelyError(error, 400);
	}
}

export const POST = withErrorHandling<CodelyError, RouteContext>(
	async (
		request: NextRequest,
		{ params }: RouteContext,
	): Promise<NextResponse> => {
		const { uuid } = await params;
		const body = await addRatingRequest(request);

		await adder.add(uuid, body.author, body.score, body.comment);

		return HttpNextResponse.created();
	},
	responseForError,
);

export const GET = withErrorHandling<CodelyError, RouteContext>(
	async (
		_request: NextRequest,
		{ params }: RouteContext,
	): Promise<NextResponse> => {
		const { uuid } = await params;

		return HttpNextResponse.ok(await summarizer.summarize(uuid));
	},
	responseForError,
);
