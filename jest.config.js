const nextJest = require("next/jest");

// Point next/jest at the app root so it can load next.config + .env files and
// wire up SWC transforms for TS/JSX exactly the way Next builds them.
const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // Only the React Testing Library suite lives in __tests__. The pre-existing
  // node:test/tsx suite under tests/** runs via `npm test` and must NOT be
  // picked up by Jest (different assertion library), so we scope Jest here.
  testMatch: ["<rootDir>/__tests__/**/*.test.{ts,tsx}"],
  moduleNameMapper: {
    // Mirror the "@/*" path alias from tsconfig.json.
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  clearMocks: true,
};

module.exports = createJestConfig(customJestConfig);
