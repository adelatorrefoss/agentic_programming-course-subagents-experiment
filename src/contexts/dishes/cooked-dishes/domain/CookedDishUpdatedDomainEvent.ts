import {
	DomainEvent,
	DomainEventAttributes,
} from "../../../shared/domain/event/DomainEvent";

import {
	CookedDishSnapshot,
	CookedDishUpdatedFields,
} from "./CookedDishSnapshot";

interface CookedDishUpdatedAttributes extends DomainEventAttributes {
	author: string;
	previous: CookedDishSnapshot;
	current: CookedDishSnapshot;
	fields: CookedDishUpdatedFields;
}

export class CookedDishUpdatedDomainEvent extends DomainEvent {
	static readonly eventName = "dishes.cooked_dish.updated";

	constructor(
		aggregateId: string,
		readonly author: string,
		readonly previous: CookedDishSnapshot,
		readonly current: CookedDishSnapshot,
		readonly fields: CookedDishUpdatedFields,
		eventId?: string,
		occurredAt?: Date,
	) {
		super(
			CookedDishUpdatedDomainEvent.eventName,
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
	): CookedDishUpdatedDomainEvent {
		const { author, previous, current, fields } =
			attributes as CookedDishUpdatedAttributes;

		return new CookedDishUpdatedDomainEvent(
			aggregateId,
			author,
			previous,
			current,
			fields,
			eventId,
			occurredAt,
		);
	}

	toPrimitives(): CookedDishUpdatedAttributes {
		return {
			author: this.author,
			previous: this.previous,
			current: this.current,
			fields: this.fields,
		};
	}
}
