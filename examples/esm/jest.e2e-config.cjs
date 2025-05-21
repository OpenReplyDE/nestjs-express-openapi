const jestConfig = require("./jest.config.cjs");

module.exports = {
  ...jestConfig,
  testMatch: ["**/*.e2e-spec.ts"],
};
