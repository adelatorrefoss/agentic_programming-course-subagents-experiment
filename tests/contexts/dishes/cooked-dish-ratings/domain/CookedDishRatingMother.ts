import { faker } from "@faker-js/faker";

import {
	CookedDishRating,
	CookedDishRatingPrimitives,
} from "../../../../../src/contexts/dishes/cooked-dish-ratings/domain/CookedDishRating";

export class CookedDishRatingMother {
	static create(
		params?: Partial<CookedDishRatingPrimitives>,
	): CookedDishRating {
		return CookedDishRating.fromPrimitives({
			id: faker.string.uuid(),
			cookedDishId: faker.string.uuid(),
			author: faker.person.fullName(),
			score: faker.number.int({ min: 1, max: 5 }),
			comment: faker.lorem.sentence(),
			createdAt: new Date(),
			...params,
		});
	}
}
