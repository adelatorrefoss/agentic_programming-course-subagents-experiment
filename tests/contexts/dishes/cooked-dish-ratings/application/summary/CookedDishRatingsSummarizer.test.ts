import { CookedDishRatingsSummarizer } from "../../../../../../src/contexts/dishes/cooked-dish-ratings/application/summary/CookedDishRatingsSummarizer";
import { CookedDishNotFoundError } from "../../../../../../src/contexts/dishes/cooked-dish-ratings/domain/CookedDishNotFoundError";
import { CookedDishMother } from "../../../cooked-dishes/domain/CookedDishMother";
import { MockCookedDishRepository } from "../../../cooked-dishes/infrastructure/MockCookedDishRepository";
import { MockCookedDishRatingRepository } from "../../infrastructure/MockCookedDishRatingRepository";

describe("CookedDishRatingsSummarizer should", () => {
	const cookedDish = CookedDishMother.create();
	const summary = {
		average: 3.5,
		total: 4,
		distribution: { 1: 0, 2: 1, 3: 1, 4: 1, 5: 1 } as {
			1: number;
			2: number;
			3: number;
			4: number;
			5: number;
		},
	};

	let repository: MockCookedDishRatingRepository;
	let cookedDishRepository: MockCookedDishRepository;
	let summarizer: CookedDishRatingsSummarizer;

	beforeEach(() => {
		repository = new MockCookedDishRatingRepository();
		cookedDishRepository = new MockCookedDishRepository();
		summarizer = new CookedDishRatingsSummarizer(
			repository,
			cookedDishRepository,
		);
	});

	it("return the average, total and distribution summary", async () => {
		cookedDishRepository.shouldSearchByIdReturn(cookedDish);
		repository.shouldSummarizeReturn(summary);

		await expect(
			summarizer.summarize(cookedDish.id.value),
		).resolves.toEqual(summary);
	});

	it("fail when the cooked dish does not exist", async () => {
		cookedDishRepository.shouldSearchByIdReturn(null);

		await expect(
			summarizer.summarize(cookedDish.id.value),
		).rejects.toBeInstanceOf(CookedDishNotFoundError);
	});
});
