import { Service } from "diod";

import { EventBus } from "../../../../shared/domain/event/EventBus";
import { TransactionManager } from "../../../../shared/domain/TransactionManager";
import { CookedDish } from "../../domain/CookedDish";
import { CookedDishId } from "../../domain/CookedDishId";
import { CookedDishRepository } from "../../domain/CookedDishRepository";

@Service()
export class CookedDishUpserter {
	constructor(
		private readonly repository: CookedDishRepository,
		private readonly eventBus: EventBus,
		private readonly transactionManager: TransactionManager,
	) {}

	async upsert(
		id: string,
		name: string,
		description: string,
		ingredients: { name: string; type: string }[],
		author: string,
	): Promise<"created" | "updated" | "unchanged"> {
		return this.transactionManager.run(async () => {
			const existing = await this.repository.searchById(
				new CookedDishId(id),
			);

			if (!existing) {
				const dish = CookedDish.create(
					id,
					name,
					description,
					ingredients,
					author,
				);
				await this.repository.save(dish);
				await this.eventBus.publish(dish.pullDomainEvents());

				return "created";
			}

			const dish = existing.update(
				name,
				description,
				ingredients,
				author,
			);
			const events = dish.pullDomainEvents();

			if (events.length === 0) {
				return "unchanged";
			}

			await this.repository.update(dish);
			await this.eventBus.publish(events);

			return "updated";
		});
	}
}
