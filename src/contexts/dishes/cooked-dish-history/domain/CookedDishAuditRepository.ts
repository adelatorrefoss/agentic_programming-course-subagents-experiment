import { CookedDishId } from "../../cooked-dishes/domain/CookedDishId";

import { CookedDishAuditEntry } from "./CookedDishAuditEntry";

export abstract class CookedDishAuditRepository {
	abstract append(entry: CookedDishAuditEntry): Promise<void>;

	abstract searchByDishId(id: CookedDishId): Promise<CookedDishAuditEntry[]>;
}
