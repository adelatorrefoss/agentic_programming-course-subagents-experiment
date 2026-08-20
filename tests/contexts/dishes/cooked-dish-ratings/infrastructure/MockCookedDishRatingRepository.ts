import { CookedDishRating } from "../../../../../src/contexts/dishes/cooked-dish-ratings/domain/CookedDishRating";
import {
	CookedDishRatingRepository,
	CookedDishRatingSummary,
} from "../../../../../src/contexts/dishes/cooked-dish-ratings/domain/CookedDishRatingRepository";
import { CookedDishId } from "../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDishId";

export class MockCookedDishRatingRepository implements CookedDishRatingRepository {
	private readonly mockSave = jest.fn();
	private readonly mockSearchByCookedDishAndAuthor = jest.fn();
	private readonly mockSummarize = jest.fn();

	async save(rating: CookedDishRating): Promise<void> {
		expect(this.mockSave).toHaveBeenCalledWith(rating.toPrimitives());
	}

	shouldSave(rating: CookedDishRating): void {
		this.mockSave(rating.toPrimitives());
	}

	async searchByCookedDishAndAuthor(
		_cookedDishId: CookedDishId,
		_author: string,
	): Promise<CookedDishRating | null> {
		return this.mockSearchByCookedDishAndAuthor() as CookedDishRating | null;
	}

	shouldSearchByCookedDishAndAuthorReturn(
		rating: CookedDishRating | null,
	): void {
		this.mockSearchByCookedDishAndAuthor.mockReturnValue(rating);
	}

	async summarize(
		_cookedDishId: CookedDishId,
	): Promise<CookedDishRatingSummary> {
		return this.mockSummarize() as CookedDishRatingSummary;
	}

	shouldSummarizeReturn(summary: CookedDishRatingSummary): void {
		this.mockSummarize.mockReturnValue(summary);
	}
}
