import { AggregateRoot } from "../../../shared/domain/AggregateRoot";
import {
	CookedDishSnapshot,
	CookedDishUpdatedFields,
} from "../../cooked-dishes/domain/CookedDishSnapshot";

export type CookedDishAuditEventType = "created" | "updated";

export type CookedDishAuditChanges =
	| { current: CookedDishSnapshot }
	| {
			previous: CookedDishSnapshot;
			current: CookedDishSnapshot;
			fields: CookedDishUpdatedFields;
	  };

export interface CookedDishAuditEntryPrimitives {
	id: string;
	type: CookedDishAuditEventType;
	entity: { type: "cooked_dish"; id: string };
	author: string;
	occurredAt: string;
	changes: CookedDishAuditChanges;
}

export class CookedDishAuditEntry extends AggregateRoot {
	constructor(
		readonly id: string,
		readonly type: CookedDishAuditEventType,
		readonly entity: { type: "cooked_dish"; id: string },
		readonly author: string,
		readonly occurredAt: Date,
		readonly changes: CookedDishAuditChanges,
	) {
		super();
	}

	static fromPrimitives(
		primitives: CookedDishAuditEntryPrimitives,
	): CookedDishAuditEntry {
		return new CookedDishAuditEntry(
			primitives.id,
			primitives.type,
			primitives.entity,
			primitives.author,
			new Date(primitives.occurredAt),
			primitives.changes,
		);
	}

	toPrimitives(): CookedDishAuditEntryPrimitives {
		return {
			id: this.id,
			type: this.type,
			entity: this.entity,
			author: this.author,
			occurredAt: this.occurredAt.toISOString(),
			changes: this.changes,
		};
	}
}
