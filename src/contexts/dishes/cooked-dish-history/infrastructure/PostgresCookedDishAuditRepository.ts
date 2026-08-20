import { Service } from "diod";
import postgres, { Row } from "postgres";

import { PostgresConnection } from "../../../shared/infrastructure/postgres/PostgresConnection";
import { PostgresRepository } from "../../../shared/infrastructure/postgres/PostgresRepository";
import { CookedDishId } from "../../cooked-dishes/domain/CookedDishId";
import {
	CookedDishAuditChanges,
	CookedDishAuditEntry,
	CookedDishAuditEventType,
} from "../domain/CookedDishAuditEntry";
import { CookedDishAuditRepository } from "../domain/CookedDishAuditRepository";

@Service()
export class PostgresCookedDishAuditRepository
	extends PostgresRepository<CookedDishAuditEntry>
	implements CookedDishAuditRepository
{
	// The explicit constructor lets DIOD resolve the inherited connection dependency.
	// eslint-disable-next-line @typescript-eslint/no-useless-constructor
	constructor(connection: PostgresConnection) {
		super(connection);
	}

	async append(entry: CookedDishAuditEntry): Promise<void> {
		const primitives = entry.toPrimitives();

		await this.execute`
			INSERT INTO dishes.cooked_dish_audit_events (
				event_id,
				cooked_dish_id,
				entity_type,
				change_type,
				changes,
				author,
				occurred_at
			)
			VALUES (
				${primitives.id},
				${primitives.entity.id},
				${primitives.entity.type},
				${primitives.type},
				${this.sql.json(primitives.changes as unknown as postgres.JSONValue)},
				${primitives.author},
				${primitives.occurredAt}
			);
		`;
	}

	async searchByDishId(id: CookedDishId): Promise<CookedDishAuditEntry[]> {
		return this.searchMany`
			SELECT
				event_id,
				cooked_dish_id,
				entity_type,
				change_type,
				changes,
				author,
				occurred_at
			FROM dishes.cooked_dish_audit_events
			WHERE cooked_dish_id = ${id.value}
			ORDER BY occurred_at ASC, event_id ASC;
		`;
	}

	protected toAggregate(row: Row): CookedDishAuditEntry {
		return CookedDishAuditEntry.fromPrimitives({
			id: row.event_id as string,
			type: row.change_type as CookedDishAuditEventType,
			entity: {
				type: row.entity_type as "cooked_dish",
				id: row.cooked_dish_id as string,
			},
			author: row.author as string,
			occurredAt: new Date(
				row.occurred_at as string | Date,
			).toISOString(),
			changes: row.changes as CookedDishAuditChanges,
		});
	}
}
