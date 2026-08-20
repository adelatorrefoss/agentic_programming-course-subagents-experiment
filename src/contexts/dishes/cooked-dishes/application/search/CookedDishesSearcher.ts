import { Service } from "diod";

import { CookedDishRepository } from "../../domain/CookedDishRepository";
import {
	CookedDishSearchCriteria,
	RawCookedDishSearchCriteria,
} from "../../domain/CookedDishSearchCriteria";
import { CookedDishSearchResult } from "../../domain/CookedDishSearchResult";

@Service()
export class CookedDishesSearcher {
	constructor(private readonly repository: CookedDishRepository) {}

	async search(
		rawCriteria: RawCookedDishSearchCriteria,
	): Promise<CookedDishSearchResult> {
		const criteria = CookedDishSearchCriteria.create(rawCriteria);
		const result = await this.repository.search(criteria);

		return {
			items: result.items,
			pagination: {
				page: criteria.page,
				pageSize: criteria.pageSize,
				totalItems: result.totalItems,
				totalPages:
					result.totalItems === 0
						? 0
						: Math.ceil(result.totalItems / criteria.pageSize),
			},
		};
	}
}
