import { AllCookedDishesSearcher } from "../../../../../../src/contexts/dishes/cooked-dishes/application/search-all/AllCookedDishesSearcher";
import { MockCookedDishRatingRepository } from "../../../cooked-dish-ratings/infrastructure/MockCookedDishRatingRepository";
import { CookedDishMother } from "../../domain/CookedDishMother";
import { MockCookedDishRepository } from "../../infrastructure/MockCookedDishRepository";

describe("AllCookedDishesSearcher should", () => {
	const repository = new MockCookedDishRepository();
	const ratingRepository = new MockCookedDishRatingRepository();
	const searcher = new AllCookedDishesSearcher(repository, ratingRepository);

	it("return all cooked dishes", async () => {
		const dishes = [
			CookedDishMother.create(),
			CookedDishMother.create(),
			CookedDishMother.create(),
		];

		repository.shouldSearchAllReturn(dishes);
		ratingRepository.shouldSummarizeManyReturn(
			new Map([
				[
					dishes[0].id.value,
					{
						average: 4.5,
						total: 2,
						distribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 },
					},
				],
			]),
		);

		const result = await searcher.searchAll();

		expect(result).toEqual(
			dishes.map((dish, index) => ({
				...dish.toPrimitives(),
				ratingSummary:
					index === 0
						? { average: 4.5, total: 2 }
						: { average: null, total: 0 },
			})),
		);
	});

	it("return empty array when no dishes exist", async () => {
		repository.shouldSearchAllReturn([]);
		ratingRepository.shouldSummarizeManyReturn(new Map());

		const result = await searcher.searchAll();

		expect(result).toEqual([]);
	});
});
