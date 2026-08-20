import { faker } from "@faker-js/faker";

import {
	WeeklyMealPlan,
	WeeklyMealPlanPrimitives,
	WeeklyMealPrimitives,
} from "../../../../../src/contexts/dishes/meal-plans/domain/WeeklyMealPlan";

export class WeeklyMealPlanMother {
	static monday(): string {
		return "2026-08-17";
	}

	static create(params?: Partial<WeeklyMealPlanPrimitives>): WeeklyMealPlan {
		const primitives: WeeklyMealPlanPrimitives = {
			id: faker.string.uuid(),
			weekStart: this.monday(),
			meals: [],
			...params,
		};

		return WeeklyMealPlan.fromPrimitives(primitives);
	}

	static assignment(params?: {
		day?: string;
		slot?: WeeklyMealPrimitives["slot"];
		cookedDishId?: string;
	}): WeeklyMealPrimitives {
		return {
			day: params?.day ?? this.monday(),
			slot: params?.slot ?? "lunch",
			cookedDishId: params?.cookedDishId ?? faker.string.uuid(),
		};
	}
}
