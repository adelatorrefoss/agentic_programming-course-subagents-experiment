import { Service } from "diod";

import { TransactionManager } from "../../domain/TransactionManager";

import { PostgresConnection } from "./PostgresConnection";

@Service()
export class PostgresTransactionManager implements TransactionManager {
	constructor(private readonly connection: PostgresConnection) {}

	async run<T>(operation: () => Promise<T>): Promise<T> {
		return this.connection.transaction(operation);
	}
}
