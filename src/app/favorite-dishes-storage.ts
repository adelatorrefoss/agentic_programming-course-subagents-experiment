export const FAVORITE_DISHES_STORAGE_KEY = "favorite-cooked-dish-ids";

export function loadFavoriteDishIds(): Set<string> {
	if (typeof window === "undefined") {
		return new Set();
	}

	const raw = window.localStorage.getItem(FAVORITE_DISHES_STORAGE_KEY);
	if (!raw) {
		return new Set();
	}

	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) {
			return new Set();
		}

		return new Set(
			parsed.filter(
				(candidate): candidate is string => typeof candidate === "string",
			),
		);
	} catch {
		return new Set();
	}
}

export function saveFavoriteDishIds(ids: Set<string>): void {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(
		FAVORITE_DISHES_STORAGE_KEY,
		JSON.stringify(Array.from(ids)),
	);
}

