import { Service } from "diod";

import { CookedDishId } from "../../../cooked-dishes/domain/CookedDishId";
import { CookedDishNotFoundError } from "../../../cooked-dishes/domain/CookedDishNotFoundError";
import { CookedDishRepository } from "../../../cooked-dishes/domain/CookedDishRepository";
import { CookedDishAuditEntry } from "../../domain/CookedDishAuditEntry";
import { CookedDishAuditRepository } from "../../domain/CookedDishAuditRepository";

export interface CookedDishHistoryEntry {
	id: string;
	type: "cooked_dish.created" | "cooked_dish.updated";
	entity: { type: "cooked_dish"; id: string };
	author: string;
	occurredAt: string;
	changes: { field: string; before: unknown | null; after: unknown }[];
}

@Service()
export class CookedDishHistorySearcher {
	constructor(
		private readonly cookedDishRepository: CookedDishRepository,
		private readonly auditRepository: CookedDishAuditRepository,
	) {}

	async search(cookedDishId: string): Promise<CookedDishHistoryEntry[]> {
		const id = new CookedDishId(cookedDishId);
		const dish = await this.cookedDishRepository.searchById(id);

		if (!dish) {
			throw new CookedDishNotFoundError(cookedDishId);
		}

		const entries = await this.auditRepository.searchByDishId(id);

		return entries.map((entry) => this.toHistoryEntry(entry));
	}

	private toHistoryEntry(
		entry: CookedDishAuditEntry,
	): CookedDishHistoryEntry {
		const primitives = entry.toPrimitives();
		const changes =
			"previous" in primitives.changes
				? Object.entries(primitives.changes.fields).map(
						([field, values]) => ({
							field,
							before: values.from,
							after: values.to,
						}),
					)
				: Object.entries(primitives.changes.current).map(
						([field, after]) => ({ field, before: null, after }),
					);

		return {
			id: primitives.id,
			type: `cooked_dish.${primitives.type}`,
			entity: primitives.entity,
			author: primitives.author,
			occurredAt: primitives.occurredAt,
			changes,
		};
	}
}
