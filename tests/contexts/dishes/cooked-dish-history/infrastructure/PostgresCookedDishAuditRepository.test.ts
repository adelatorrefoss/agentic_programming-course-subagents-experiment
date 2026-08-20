import "reflect-metadata";

import { CookedDishAuditEntry } from "../../../../../src/contexts/dishes/cooked-dish-history/domain/CookedDishAuditEntry";
import { PostgresCookedDishAuditRepository } from "../../../../../src/contexts/dishes/cooked-dish-history/infrastructure/PostgresCookedDishAuditRepository";
import { CookedDishId } from "../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDishId";
import { PostgresConnection } from "../../../../../src/contexts/shared/infrastructure/postgres/PostgresConnection";
import { PostgresTransactionManager } from "../../../../../src/contexts/shared/infrastructure/postgres/PostgresTransactionManager";

const connection = new PostgresConnection(
	"localhost",
	5432,
	"supabase_admin",
	"c0d3ly7v",
	"postgres",
);
const repository = new PostgresCookedDishAuditRepository(connection);
const transactionManager = new PostgresTransactionManager(connection);
const embedding = JSON.stringify(new Array(1024).fill(0));

const dishId = "00000000-0000-4000-8000-000000000100";
const snapshot = {
	id: dishId,
	name: "Lentil stew",
	description: "A warming stew",
	ingredients: [{ name: "Lentils", type: "main" }],
};

async function insertDish(id = dishId): Promise<void> {
	await connection.sql`
		INSERT INTO dishes.cooked_dishes
			(id, name, description, ingredients, embedding)
		VALUES (
			${id},
			${snapshot.name},
			${snapshot.description},
			${connection.sql.json(snapshot.ingredients)},
			${embedding}::vector
		);
	`;
}

function auditEntry(params?: {
	id?: string;
	author?: string;
	occurredAt?: string;
}): CookedDishAuditEntry {
	return CookedDishAuditEntry.fromPrimitives({
		id: params?.id ?? "00000000-0000-4000-8000-000000000200",
		type: "created",
		entity: { type: "cooked_dish", id: dishId },
		author: params?.author ?? "chef@example.com",
		occurredAt: params?.occurredAt ?? "2026-08-20T08:00:00.000Z",
		changes: { current: snapshot },
	});
}

describe("PostgresCookedDishAuditRepository should", () => {
	beforeEach(async () => {
		await connection.truncateAll();
	});

	afterAll(async () => {
		await connection.end();
	});

	it("append and rehydrate an audit entry", async () => {
		await insertDish();
		const entry = auditEntry();

		await repository.append(entry);

		const result = await repository.searchByDishId(
			new CookedDishId(dishId),
		);
		expect(result.map((item) => item.toPrimitives())).toEqual([
			entry.toPrimitives(),
		]);
	});

	it("order equal timestamps deterministically by event id", async () => {
		await insertDish();
		const laterId = auditEntry({
			id: "00000000-0000-4000-8000-000000000302",
		});
		const earlierId = auditEntry({
			id: "00000000-0000-4000-8000-000000000301",
		});
		await repository.append(laterId);
		await repository.append(earlierId);

		const result = await repository.searchByDishId(
			new CookedDishId(dishId),
		);

		expect(result.map((item) => item.id)).toEqual([
			earlierId.id,
			laterId.id,
		]);
	});

	it("reject updates and deletes at the database boundary", async () => {
		await insertDish();
		const entry = auditEntry();
		await repository.append(entry);

		await expect(connection.sql`
			UPDATE dishes.cooked_dish_audit_events
			SET author = ${"another-chef"}
			WHERE event_id = ${entry.id};
		`).rejects.toThrow("append-only");
		await expect(connection.sql`
			DELETE FROM dishes.cooked_dish_audit_events
			WHERE event_id = ${entry.id};
		`).rejects.toThrow("append-only");
	});

	it("roll back the dish mutation when audit persistence fails", async () => {
		await expect(
			transactionManager.run(async () => {
				await insertDish();
				await repository.append(auditEntry({ author: " " }));
			}),
		).rejects.toThrow();

		const [dishRows, auditRows] = await Promise.all([
			connection.sql`
				SELECT id FROM dishes.cooked_dishes WHERE id = ${dishId};
			`,
			connection.sql`
				SELECT event_id FROM dishes.cooked_dish_audit_events
				WHERE cooked_dish_id = ${dishId};
			`,
		]);
		expect(dishRows).toHaveLength(0);
		expect(auditRows).toHaveLength(0);
	});
});
