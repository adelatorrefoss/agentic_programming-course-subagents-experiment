import { CookedDishRatingAdder } from "../../../../../../src/contexts/dishes/cooked-dish-ratings/application/add/CookedDishRatingAdder";
import { CookedDishNotFoundError } from "../../../../../../src/contexts/dishes/cooked-dish-ratings/domain/CookedDishNotFoundError";
import { CookedDishRatingAlreadyExistsError } from "../../../../../../src/contexts/dishes/cooked-dish-ratings/domain/CookedDishRatingAlreadyExistsError";
import { InvalidCookedDishRatingScoreError } from "../../../../../../src/contexts/dishes/cooked-dish-ratings/domain/InvalidCookedDishRatingScoreError";
import { MockUuidGenerator } from "../../../../shared/domain/MockUuidGenerator";
import { CookedDishMother } from "../../../cooked-dishes/domain/CookedDishMother";
import { MockCookedDishRepository } from "../../../cooked-dishes/infrastructure/MockCookedDishRepository";
import { CookedDishRatingMother } from "../../domain/CookedDishRatingMother";
import { MockCookedDishRatingRepository } from "../../infrastructure/MockCookedDishRatingRepository";

describe("CookedDishRatingAdder should", () => {
	const cookedDish = CookedDishMother.create();
	const rating = CookedDishRatingMother.create({
		cookedDishId: cookedDish.id.value,
	});

	let repository: MockCookedDishRatingRepository;
	let cookedDishRepository: MockCookedDishRepository;
	let uuidGenerator: MockUuidGenerator;
	let adder: CookedDishRatingAdder;

	beforeEach(() => {
		repository = new MockCookedDishRatingRepository();
		cookedDishRepository = new MockCookedDishRepository();
		uuidGenerator = new MockUuidGenerator();
		adder = new CookedDishRatingAdder(
			repository,
			cookedDishRepository,
			uuidGenerator,
		);
		cookedDishRepository.shouldSearchByIdReturn(cookedDish);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it("add a rating", async () => {
		const now = new Date();
		jest.useFakeTimers().setSystemTime(now);
		const expectedRating = CookedDishRatingMother.create({
			...rating.toPrimitives(),
			createdAt: now,
		});

		uuidGenerator.shouldGenerate(expectedRating.id.value);
		repository.shouldSave(expectedRating);

		await adder.add(
			cookedDish.id.value,
			expectedRating.author,
			expectedRating.score.value,
			expectedRating.comment,
		);
	});

	it("fail when the cooked dish does not exist", async () => {
		cookedDishRepository.shouldSearchByIdReturn(null);

		await expect(
			adder.add(cookedDish.id.value, rating.author, rating.score.value),
		).rejects.toBeInstanceOf(CookedDishNotFoundError);
	});

	it("fail when the score is invalid", async () => {
		uuidGenerator.shouldGenerate(rating.id.value);

		await expect(
			adder.add(cookedDish.id.value, rating.author, 6),
		).rejects.toBeInstanceOf(InvalidCookedDishRatingScoreError);
	});

	it("fail when the author already rated the cooked dish", async () => {
		uuidGenerator.shouldGenerate(rating.id.value);
		repository.shouldSearchByCookedDishAndAuthorReturn(rating);

		await expect(
			adder.add(cookedDish.id.value, rating.author, 5),
		).rejects.toEqual(
			new CookedDishRatingAlreadyExistsError(
				cookedDish.id.value,
				rating.author,
			),
		);
	});
});
