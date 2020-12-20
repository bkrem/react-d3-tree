module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ["<rootDir>/src/"],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    '\\.(ts|tsx)$': 'ts-jest',
  },
  setupFilesAfterEnv: ["<rootDir>/jest/setup.ts"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/index.js",
    "!src/**/*.test.{js,jsx,ts,tsx}",
  ],
  coverageThreshold: {
    "global": {
      "statements": 94,
      "branches": 84,
      "functions": 90,
      "lines": 94,
    },
  },
  moduleNameMapper: {
    ".*\\.(css|less|styl|scss|sass)$": "<rootDir>/jest/mocks/cssModule.js",
  },
}