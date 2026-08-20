import { MealSlot } from "./meal-plan-api";

export const MEAL_SLOTS: readonly MealSlot[] = ["breakfast", "lunch", "dinner"];

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function toIsoDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}

export function mondayFor(date: Date): string {
	const utcDate = new Date(
		Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
	);
	const daysSinceMonday = (utcDate.getUTCDay() + 6) % 7;

	return toIsoDate(new Date(utcDate.getTime() - daysSinceMonday * DAY_IN_MS));
}

export function daysForWeek(weekStart: string): string[] {
	const monday = new Date(`${weekStart}T00:00:00.000Z`);

	return Array.from({ length: 7 }, (_, index) =>
		toIsoDate(new Date(monday.getTime() + index * DAY_IN_MS)),
	);
}

export function moveWeek(weekStart: string, offset: number): string {
	const monday = new Date(`${weekStart}T00:00:00.000Z`);

	return toIsoDate(new Date(monday.getTime() + offset * 7 * DAY_IN_MS));
}

export function formatDay(day: string): { weekday: string; date: string } {
	const parsed = new Date(`${day}T00:00:00.000Z`);

	return {
		weekday: new Intl.DateTimeFormat("en", {
			weekday: "short",
			timeZone: "UTC",
		}).format(parsed),
		date: new Intl.DateTimeFormat("en", {
			day: "numeric",
			month: "short",
			timeZone: "UTC",
		}).format(parsed),
	};
}
