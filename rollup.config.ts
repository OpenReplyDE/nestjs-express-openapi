import type { RollupOptions } from "rollup";

const config: RollupOptions[] = [
  {
    // This config will be merged with pkgroll's auto-generated config
    output: {
      // Prevent rollup-plugin-dts from resolving certain imports
      globals: {
        express: "express",
        "@types/express": "@types/express",
        "@types/body-parser": "@types/body-parser",
        "@types/connect": "@types/connect",
      },
    },
  },
];

export default config;
