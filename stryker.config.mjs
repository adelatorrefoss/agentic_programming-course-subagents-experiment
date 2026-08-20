/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
	mutate: ["src/**/*.{ts,tsx}"],
	testRunner: "jest",
	jest: {
		configFile: "jest.config.js",
		projectType: "custom",
	},
	reporters: ["clear-text", "progress", "html"],
	htmlReporter: {
		fileName: "reports/mutation/index.html",
	},
	// Per-test coverage requires Stryker-specific Jest environments in every
	// file-level jsdom test. Keep the existing mixed node/jsdom suite untouched.
	coverageAnalysis: "off",
	concurrency: 2,
	tempDirName: ".stryker-tmp",
	cleanTempDir: "always",
	timeoutMS: 10000,
	thresholds: {
		high: 80,
		low: 60,
		break: 0,
	},
};

export default config;
