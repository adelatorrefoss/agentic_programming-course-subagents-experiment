import { Service } from "diod";

import { EventBus } from "../../../../shared/domain/event/EventBus";
import { TransactionManager } from "../../../../shared/domain/TransactionManager";
import { CookedDish } from "../../domain/CookedDish";
import { CookedDishRepository } from "../../domain/CookedDishRepository";

@Service()
export class CookedDishCreator {
	constructor(
		private readonly repository: CookedDishRepository,
		private readonly eventBus: EventBus,
		private readonly transactionManager: TransactionManager,
	) {}

	async create(
		id: string,
		name: string,
		description: string,
		ingredients: { name: string; type: string }[],
		author: string,
	): Promise<void> {
		const dish = CookedDish.create(
			id,
			name,
			description,
			ingredients,
			author,
		);

		await this.transactionManager.run(async () => {
			await this.repository.save(dish);
			await this.eventBus.publish(dish.pullDomainEvents());
		});
	}
}
