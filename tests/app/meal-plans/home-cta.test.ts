import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("home meal-planner entry point should", () => {
	it("expose a visible link to the weekly planner", () => {
		const homeSource = readFileSync(
			resolve(process.cwd(), "src/app/page.tsx"),
			"utf8",
		);

		expect(homeSource).toContain('href="/meal-plans"');
		expect(homeSource).toMatch(/Plan (?:your )?week/i);
	});
});
