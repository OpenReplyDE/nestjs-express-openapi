const jestEsmConfig = require("./jest.esm-config.cjs");

module.exports = {
  ...jestEsmConfig,
  testMatch: ["**/*.spec.ts"],
  resetMocks: true,
  maxWorkers: 1,
  collectCoverage: false,
  logHeapUsage: true,
  forceExit: true,
};
