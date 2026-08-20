import { TransactionManager } from "../../../../src/contexts/shared/domain/TransactionManager";

export class MockTransactionManager implements TransactionManager {
	async run<T>(operation: () => Promise<T>): Promise<T> {
		return operation();
	}
}
