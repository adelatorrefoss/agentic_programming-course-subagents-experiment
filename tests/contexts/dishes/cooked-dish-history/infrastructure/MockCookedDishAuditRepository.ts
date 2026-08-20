import { CookedDishAuditEntry } from "../../../../../src/contexts/dishes/cooked-dish-history/domain/CookedDishAuditEntry";
import { CookedDishAuditRepository } from "../../../../../src/contexts/dishes/cooked-dish-history/domain/CookedDishAuditRepository";
import { CookedDishId } from "../../../../../src/contexts/dishes/cooked-dishes/domain/CookedDishId";

export class MockCookedDishAuditRepository implements CookedDishAuditRepository {
	private readonly mockAppend = jest.fn();
	private readonly mockSearchByDishId = jest.fn();
	private appendError: Error | null = null;

	async append(entry: CookedDishAuditEntry): Promise<void> {
		expect(this.mockAppend).toHaveBeenCalledWith(entry.toPrimitives());
		if (this.appendError) {
			throw this.appendError;
		}
	}

	shouldAppend(entry: CookedDishAuditEntry): void {
		this.mockAppend(entry.toPrimitives());
	}

	shouldAppendFail(error: Error): void {
		this.appendError = error;
	}

	async searchByDishId(_id: CookedDishId): Promise<CookedDishAuditEntry[]> {
		return this.mockSearchByDishId() as CookedDishAuditEntry[];
	}

	shouldSearchByDishIdReturn(entries: CookedDishAuditEntry[]): void {
		this.mockSearchByDishId.mockReturnValue(entries);
	}
}
