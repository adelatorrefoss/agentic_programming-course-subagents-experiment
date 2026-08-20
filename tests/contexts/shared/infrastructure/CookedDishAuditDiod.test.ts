import "reflect-metadata";

import { CookedDishAuditRecorder } from "../../../../src/contexts/dishes/cooked-dish-history/application/record/CookedDishAuditRecorder";
import { CookedDishHistorySearcher } from "../../../../src/contexts/dishes/cooked-dish-history/application/search/CookedDishHistorySearcher";
import { DomainEvent } from "../../../../src/contexts/shared/domain/event/DomainEvent";
import { DomainEventSubscriber } from "../../../../src/contexts/shared/domain/event/DomainEventSubscriber";
import { container } from "../../../../src/contexts/shared/infrastructure/dependency-injection/diod.config";

describe("audit DIOD configuration should", () => {
	it("resolve the searcher and discover the recorder as a subscriber", () => {
		expect(container.get(CookedDishHistorySearcher)).toBeInstanceOf(
			CookedDishHistorySearcher,
		);
		const subscribers = container
			.findTaggedServiceIdentifiers<
				DomainEventSubscriber<DomainEvent>
			>("subscriber")
			.map((identifier) => container.get(identifier));
		expect(subscribers).toEqual(
			expect.arrayContaining([expect.any(CookedDishAuditRecorder)]),
		);
	});
});
