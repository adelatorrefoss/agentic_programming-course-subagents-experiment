import {
	CookedDishSearchCriteria,
	RawCookedDishSearchCriteria,
} from "../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDishSearchCriteria";
import { InvalidCookedDishSearchCriteriaError } from "../../../../../src/contexts/dishes/cooked-dishes/domain/InvalidCookedDishSearchCriteriaError";

describe("CookedDishSearchCriteria should", () => {
	it("apply safe pagination and ordering defaults", () => {
		const criteria = CookedDishSearchCriteria.create();

		expect(criteria).toMatchObject({
			text: undefined,
			ingredientTypes: [],
			minimumRating: undefined,
			sortBy: "cookedAt",
			sortDirection: "desc",
			page: 1,
			pageSize: 12,
		});
		expect(criteria.offset).toBe(0);
	});

	it("normalize text, deduplicate types and preserve all combined filters", () => {
		const criteria = CookedDishSearchCriteria.create({
			text: "  50% chef's_rice  ",
			ingredientTypes: ["main", "household_staple", "main"],
			minimumRating: 0,
			cookedFrom: "2026-01-01",
			cookedTo: "2026-12-31",
			sortBy: "rating",
			sortDirection: "asc",
			page: 3,
			pageSize: 50,
		});

		expect(criteria).toMatchObject({
			text: "50% chef's_rice",
			ingredientTypes: ["main", "household_staple"],
			minimumRating: 0,
			cookedFrom: "2026-01-01",
			cookedTo: "2026-12-31",
			sortBy: "rating",
			sortDirection: "asc",
			page: 3,
			pageSize: 50,
		});
		expect(criteria.offset).toBe(100);
	});

	it("parse numeric HTTP values without coupling the route to domain rules", () => {
		expect(
			CookedDishSearchCriteria.create({
				minimumRating: "4.5",
				page: "2",
				pageSize: "5",
			}),
		).toMatchObject({ minimumRating: 4.5, page: 2, pageSize: 5 });
	});

	it.each([
		[{ text: " " }, "text"],
		[{ text: "x".repeat(101) }, "text"],
		[{ ingredientTypes: ["unknown"] }, "ingredientType"],
		[{ minimumRating: -0.1 }, "minimumRating"],
		[{ minimumRating: 5.1 }, "minimumRating"],
		[{ cookedFrom: "2026-02-30" }, "cookedFrom"],
		[{ cookedFrom: "2026-08-20", cookedTo: "2026-08-19" }, "cookedFrom"],
		[{ sortBy: "description" }, "sortBy"],
		[{ sortDirection: "sideways" }, "sortDirection"],
		[{ page: 0 }, "page"],
		[{ page: 1.5 }, "page"],
		[{ pageSize: 0 }, "pageSize"],
		[{ pageSize: 51 }, "pageSize"],
	] as const)("reject invalid criteria %j for %s", (raw, field) => {
		try {
			CookedDishSearchCriteria.create(raw as RawCookedDishSearchCriteria);
			throw new Error("expected criteria validation to fail");
		} catch (error) {
			expect(error).toBeInstanceOf(InvalidCookedDishSearchCriteriaError);
			expect(
				(error as InvalidCookedDishSearchCriteriaError).params,
			).toMatchObject({
				field,
			});
		}
	});
});
