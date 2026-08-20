import "reflect-metadata";

import { CookedDishAuditRecorder } from "../../../../../src/contexts/dishes/cooked-dish-history/application/record/CookedDishAuditRecorder";
import { PostgresCookedDishAuditRepository } from "../../../../../src/contexts/dishes/cooked-dish-history/infrastructure/PostgresCookedDishAuditRepository";
import { CookedDishCreator } from "../../../../../src/contexts/dishes/cooked-dishes/application/create/CookedDishCreator";
import { CookedDishUpserter } from "../../../../../src/contexts/dishes/cooked-dishes/application/upsert/CookedDishUpserter";
import { PostgresCookedDishRepository } from "../../../../../src/contexts/dishes/cooked-dishes/infrastructure/PostgresCookedDishRepository";
import { EmbeddingsGenerator } from "../../../../../src/contexts/shared/domain/EmbeddingsGenerator";
import { DomainEvent } from "../../../../../src/contexts/shared/domain/event/DomainEvent";
import { EventBus } from "../../../../../src/contexts/shared/domain/event/EventBus";
import { PostgresConnection } from "../../../../../src/contexts/shared/infrastructure/postgres/PostgresConnection";
import { PostgresTransactionManager } from "../../../../../src/contexts/shared/infrastructure/postgres/PostgresTransactionManager";

class ZeroEmbeddingsGenerator extends EmbeddingsGenerator {
	async embed(_text: string): Promise<number[]> {
		return new Array(1024).fill(0) as number[];
	}
}

class AuditEventBus extends EventBus {
	constructor(private readonly recorder: CookedDishAuditRecorder) {
		super();
	}

	async publish(events: DomainEvent[]): Promise<void> {
		await Promise.all(
			events.map((event) =>
				this.recorder.on(
					event as Parameters<CookedDishAuditRecorder["on"]>[0],
				),
			),
		);
	}
}

const connectionParams = [
	"localhost",
	5432,
	"supabase_admin",
	"c0d3ly7v",
	"postgres",
] as const;
const connection = new PostgresConnection(...connectionParams);
const observer = new PostgresConnection(...connectionParams);
const dishRepository = new PostgresCookedDishRepository(
	connection,
	new ZeroEmbeddingsGenerator(),
);
const auditRepository = new PostgresCookedDishAuditRepository(connection);
const eventBus = new AuditEventBus(
	new CookedDishAuditRecorder(auditRepository),
);
const transactions = new PostgresTransactionManager(connection);
const creator = new CookedDishCreator(dishRepository, eventBus, transactions);
const upserter = new CookedDishUpserter(dishRepository, eventBus, transactions);
const ingredients = [{ name: "Lentils", type: "main" }];

describe("cooked dish audit transaction should", () => {
	beforeEach(async () => connection.truncateAll());
	afterAll(async () => {
		await connection.end();
		await observer.end();
	});

	it("roll back creation when the audit subscriber rejects", async () => {
		const id = "00000000-0000-4000-8000-000000000501";
		await expect(
			creator.create(id, "Stew", "Warm", ingredients, " "),
		).rejects.toThrow();

		const dishes =
			await observer.sql`SELECT id FROM dishes.cooked_dishes WHERE id = ${id}`;
		const audits =
			await observer.sql`SELECT event_id FROM dishes.cooked_dish_audit_events WHERE cooked_dish_id = ${id}`;
		expect(dishes).toHaveLength(0);
		expect(audits).toHaveLength(0);
	});

	it("roll back an update and retain its previous audit history", async () => {
		const id = "00000000-0000-4000-8000-000000000502";
		await creator.create(id, "Original", "Warm", ingredients, "creator");
		await expect(
			upserter.upsert(id, "Changed", "Warm", ingredients, " "),
		).rejects.toThrow();

		const dishes =
			await observer.sql`SELECT name FROM dishes.cooked_dishes WHERE id = ${id}`;
		const audits = await observer.sql`
			SELECT change_type FROM dishes.cooked_dish_audit_events
			WHERE cooked_dish_id = ${id} ORDER BY occurred_at, event_id
		`;
		expect(dishes[0].name).toBe("Original");
		expect(audits.map((row) => row.change_type)).toEqual(["created"]);
	});
});
