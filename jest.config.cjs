const fs = require("node:fs");

const swcConfig = JSON.parse(fs.readFileSync(`${__dirname}/.swcrc`, "utf-8"));

module.exports = {
  testEnvironment: "node",
  moduleFileExtensions: ["js", "json", "ts"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        ...swcConfig,
        module: {
          ...swcConfig.module,
          resolveFully: true,
        },
        jsc: {
          ...(swcConfig.jsc ?? {}),
          experimental: {
            ...(swcConfig.jsc?.experimental ?? {}),
            plugins: [
              ...(swcConfig.jsc?.experimental?.plugins ?? []),
              [
                "@swc/plugin-transform-imports",
                {
                  "^(.*?)(\\.js)$": {
                    // remove js suffix from local imports:
                    transform: "{{matches.[1]}}",
                    skipDefaultConversion: true,
                    preventFullImport: true,
                    handleDefaultImport: true,
                    handleNamespaceImport: true,
                  },
                },
              ],
            ],
          },
        },
      },
    ],
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  setupFiles: ["<rootDir>/jest-setup.mjs"],
  testMatch: ["**/*.spec.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/examples/"],
  maxWorkers: 1,
  resetMocks: true,
  resetModules: true,
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  cache: false,
  verbose: true,
  silent: false,
  detectOpenHandles: true,
  coveragePathIgnorePatterns: ["/node_modules/", "dist/", "generated/"],
};
