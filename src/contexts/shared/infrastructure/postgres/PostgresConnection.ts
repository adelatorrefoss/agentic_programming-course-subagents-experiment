import { AsyncLocalStorage } from "node:async_hooks";
import postgres from "postgres";

export class PostgresConnection {
	private readonly rootSql: postgres.Sql;
	private readonly transactionContext = new AsyncLocalStorage<postgres.Sql>();

	constructor(
		host: string,
		port: number,
		user: string,
		password: string,
		database: string,
	) {
		this.rootSql = postgres({
			host,
			port,
			user,
			password,
			database,
			onnotice: () => {},
		});
	}

	get sql(): postgres.Sql {
		return this.transactionContext.getStore() ?? this.rootSql;
	}

	async transaction<T>(operation: () => Promise<T>): Promise<T> {
		if (this.transactionContext.getStore()) {
			return operation();
		}

		return this.rootSql.begin((transactionSql) =>
			this.transactionContext.run(
				transactionSql as unknown as postgres.Sql,
				operation,
			),
		) as Promise<T>;
	}

	async end(): Promise<void> {
		await this.rootSql.end();
	}

	async truncateAll(): Promise<void> {
		await this.sql`DO
$$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename
              FROM pg_tables
              WHERE schemaname IN ('shared', 'dishes', 'public'))
    LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END
$$;`;
	}
}
