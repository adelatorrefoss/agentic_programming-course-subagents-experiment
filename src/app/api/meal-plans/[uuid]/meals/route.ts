import "reflect-metadata";

import { NextRequest, NextResponse } from "next/server";

import { WeeklyMealPlanMealAssigner } from "../../../../../contexts/dishes/meal-plans/application/assign-meal/WeeklyMealPlanMealAssigner";
import { WeeklyMealPlanMealRemover } from "../../../../../contexts/dishes/meal-plans/application/remove-meal/WeeklyMealPlanMealRemover";
import { WeeklyMealPlanMealReplacer } from "../../../../../contexts/dishes/meal-plans/application/replace-meal/WeeklyMealPlanMealReplacer";
import { responseForMealPlanError } from "../../../../../contexts/dishes/meal-plans/infrastructure/http/responseForMealPlanError";
import { container } from "../../../../../contexts/shared/infrastructure/dependency-injection/diod.config";
import { HttpNextResponse } from "../../../../../contexts/shared/infrastructure/http/HttpNextResponse";
import { withErrorHandling } from "../../../../../contexts/shared/infrastructure/http/withErrorHandling";

type RouteContext = { params: Promise<{ uuid: string }> };

const assigner = container.get(WeeklyMealPlanMealAssigner);
const replacer = container.get(WeeklyMealPlanMealReplacer);
const remover = container.get(WeeklyMealPlanMealRemover);

export const POST = withErrorHandling(
	async (
		request: NextRequest,
		{ params }: RouteContext,
	): Promise<NextResponse> => {
		const { uuid } = await params;
		const body = await request.json();

		await assigner.assign(uuid, body.day, body.slot, body.cookedDishId);

		return HttpNextResponse.created();
	},
	responseForMealPlanError,
);

export const PUT = withErrorHandling(
	async (
		request: NextRequest,
		{ params }: RouteContext,
	): Promise<NextResponse> => {
		const { uuid } = await params;
		const body = await request.json();

		await replacer.replace(uuid, body.day, body.slot, body.cookedDishId);

		return HttpNextResponse.ok(null);
	},
	responseForMealPlanError,
);

export const DELETE = withErrorHandling(
	async (
		request: NextRequest,
		{ params }: RouteContext,
	): Promise<NextResponse> => {
		const { uuid } = await params;
		const body = await request.json();

		await remover.remove(uuid, body.day, body.slot);

		return new NextResponse(null, { status: 204 });
	},
	responseForMealPlanError,
);
