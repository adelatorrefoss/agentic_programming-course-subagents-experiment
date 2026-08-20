import { Service } from "diod";

import { DomainEventSubscriber } from "../../../../shared/domain/event/DomainEventSubscriber";
import { CookedDishCreatedDomainEvent } from "../../../cooked-dishes/domain/CookedDishCreatedDomainEvent";
import { CookedDishUpdatedDomainEvent } from "../../../cooked-dishes/domain/CookedDishUpdatedDomainEvent";
import { CookedDishAuditEntry } from "../../domain/CookedDishAuditEntry";
import { CookedDishAuditRepository } from "../../domain/CookedDishAuditRepository";

type AuditedCookedDishEvent =
	| CookedDishCreatedDomainEvent
	| CookedDishUpdatedDomainEvent;

@Service()
export class CookedDishAuditRecorder implements DomainEventSubscriber<AuditedCookedDishEvent> {
	constructor(private readonly repository: CookedDishAuditRepository) {}

	async on(event: AuditedCookedDishEvent): Promise<void> {
		const changes =
			event instanceof CookedDishCreatedDomainEvent
				? { current: event.current }
				: {
						previous: event.previous,
						current: event.current,
						fields: event.fields,
					};
		const type =
			event instanceof CookedDishCreatedDomainEvent
				? "created"
				: "updated";

		await this.repository.append(
			new CookedDishAuditEntry(
				event.eventId,
				type,
				{ type: "cooked_dish", id: event.aggregateId },
				event.author,
				event.occurredAt,
				changes,
			),
		);
	}

	subscribedTo(): [
		typeof CookedDishCreatedDomainEvent,
		typeof CookedDishUpdatedDomainEvent,
	] {
		return [CookedDishCreatedDomainEvent, CookedDishUpdatedDomainEvent];
	}

	name(): string {
		return "CookedDishAuditRecorder";
	}
}
