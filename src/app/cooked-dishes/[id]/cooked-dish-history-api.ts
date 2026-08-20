export type CookedDishHistoryEventType =
	| "cooked_dish.created"
	| "cooked_dish.updated";

export interface CookedDishHistoryChange {
	field: string;
	before: unknown | null;
	after: unknown;
}

export interface CookedDishHistoryEntry {
	id: string;
	type: CookedDishHistoryEventType;
	entity: { type: "cooked_dish"; id: string };
	author: string;
	occurredAt: string;
	changes: CookedDishHistoryChange[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isHistoryChange(value: unknown): value is CookedDishHistoryChange {
	return (
		isRecord(value) &&
		typeof value.field === "string" &&
		"before" in value &&
		"after" in value
	);
}

function isHistoryEntry(value: unknown): value is CookedDishHistoryEntry {
	if (!isRecord(value) || !isRecord(value.entity)) {
		return false;
	}

	return (
		typeof value.id === "string" &&
		(value.type === "cooked_dish.created" ||
			value.type === "cooked_dish.updated") &&
		value.entity.type === "cooked_dish" &&
		typeof value.entity.id === "string" &&
		typeof value.author === "string" &&
		typeof value.occurredAt === "string" &&
		!Number.isNaN(Date.parse(value.occurredAt)) &&
		Array.isArray(value.changes) &&
		value.changes.every(isHistoryChange)
	);
}

export function parseCookedDishHistory(
	payload: unknown,
): CookedDishHistoryEntry[] {
	if (
		!isRecord(payload) ||
		!Array.isArray(payload.items) ||
		!payload.items.every(isHistoryEntry)
	) {
		throw new Error("Cooked dish history has an invalid response shape");
	}

	return [...payload.items].sort((left, right) => {
		const byDate =
			Date.parse(left.occurredAt) - Date.parse(right.occurredAt);

		return byDate || left.id.localeCompare(right.id);
	});
}

export async function loadCookedDishHistory(
	dishId: string,
	signal?: AbortSignal,
): Promise<CookedDishHistoryEntry[]> {
	const response = await fetch(
		`/api/cooked-dishes/${encodeURIComponent(dishId)}/history`,
		{ signal },
	);

	if (!response.ok) {
		throw new Error(
			`Unable to load cooked dish history (${response.status})`,
		);
	}

	return parseCookedDishHistory(await response.json());
}
