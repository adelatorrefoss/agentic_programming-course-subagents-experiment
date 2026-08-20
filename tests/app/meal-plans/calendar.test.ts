import {
	daysForWeek,
	MEAL_SLOTS,
	mondayFor,
	moveWeek,
} from "../../../src/app/meal-plans/calendar";

describe("meal-plan calendar helpers should", () => {
	it.each([
		["2026-03-29T23:30:00.000-04:00", "2026-03-30"],
		["2026-10-25T01:30:00.000+02:00", "2026-10-19"],
		["2026-08-23T23:59:59.000Z", "2026-08-17"],
	])("derive an ISO Monday in UTC from %s", (input, expected) => {
		expect(mondayFor(new Date(input))).toBe(expected);
	});

	it("generate seven consecutive UTC dates and twenty-one meal cells", () => {
		const days = daysForWeek("2026-08-17");
		const cells = days.flatMap((day) =>
			MEAL_SLOTS.map((slot) => ({ day, slot })),
		);

		expect(days).toEqual([
			"2026-08-17",
			"2026-08-18",
			"2026-08-19",
			"2026-08-20",
			"2026-08-21",
			"2026-08-22",
			"2026-08-23",
		]);
		expect(MEAL_SLOTS).toEqual(["breakfast", "lunch", "dinner"]);
		expect(cells).toHaveLength(21);
		expect(
			new Set(cells.map(({ day, slot }) => `${day}:${slot}`)).size,
		).toBe(21);
	});

	it("navigate whole weeks without local-time drift", () => {
		expect(moveWeek("2026-03-30", -1)).toBe("2026-03-23");
		expect(moveWeek("2026-03-30", 1)).toBe("2026-04-06");
	});
});
