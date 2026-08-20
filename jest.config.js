/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	testTimeout: 10000,
	maxWorkers: 1,
	injectGlobals: true,
	transform: {
		"^.+\\.tsx?$": [
			"@swc/jest",
			{
				sourceMaps: true,
				jsc: {
					parser: {
						syntax: "typescript",
						tsx: true,
						decorators: true,
					},
					transform: {
						legacyDecorator: true,
						decoratorMetadata: true,
						react: { runtime: "automatic" },
					},
				},
			},
		],
		"^.+\\.m?js$": "@swc/jest",
	},
	moduleNameMapper: {
		"\\.module\\.css$": "<rootDir>/tests/styleMock.js",
	},
	testPathIgnorePatterns: ["node_modules"],
	transformIgnorePatterns: [
		"/node_modules/(?!(nanoid|uuid|@codelytv/mcp-client|@modelcontextprotocol/sdk|@faker-js)/)",
	],
};
