import {
	DomainEvent,
	DomainEventAttributes,
} from "../../../shared/domain/event/DomainEvent";

import { CookedDishSnapshot } from "./CookedDishSnapshot";

interface CookedDishCreatedAttributes extends DomainEventAttributes {
	author: string;
	current: CookedDishSnapshot;
}

export class CookedDishCreatedDomainEvent extends DomainEvent {
	static readonly eventName = "dishes.cooked_dish.created";

	constructor(
		aggregateId: string,
		readonly author: string,
		readonly current: CookedDishSnapshot,
		eventId?: string,
		occurredAt?: Date,
	) {
		super(
			CookedDishCreatedDomainEvent.eventName,
			aggregateId,
			eventId,
			occurredAt,
		);
	}

	static fromPrimitives(
		aggregateId: string,
		eventId: string,
		occurredAt: Date,
		attributes: DomainEventAttributes,
	): CookedDishCreatedDomainEvent {
		const { author, current } = attributes as CookedDishCreatedAttributes;

		return new CookedDishCreatedDomainEvent(
			aggregateId,
			author,
			current,
			eventId,
			occurredAt,
		);
	}

	toPrimitives(): CookedDishCreatedAttributes {
		return { author: this.author, current: this.current };
	}
}
