import { InvalidCookedDishRatingScoreError } from "../../../../../src/contexts/dishes/cooked-dish-ratings/domain/InvalidCookedDishRatingScoreError";

import { CookedDishRatingMother } from "./CookedDishRatingMother";

describe("CookedDishRating should", () => {
	it("create a rating and normalize its author", () => {
		const rating = CookedDishRatingMother.create({
			author: "  Ada Lovelace  ",
			comment: null,
		});

		expect(rating.toPrimitives()).toEqual(
			expect.objectContaining({
				author: "Ada Lovelace",
				comment: null,
			}),
		);
	});

	it.each([0, 6, 1.5, Number.NaN])("reject an invalid score: %s", (score) => {
		expect(() => CookedDishRatingMother.create({ score })).toThrow(
			InvalidCookedDishRatingScoreError,
		);
	});
});
