#!/usr/bin/env node
import console from "node:console";

import yargs from "yargs";

import { compileCommandModule } from "./commands/compile.js";

yargs(process.argv.slice(2))
  .config()
  .env("OPENAPI_TO_TYPESCRIPT")
  .help()
  .command(compileCommandModule)
  .demandCommand()
  .parseAsync()
  .catch((error) => {
    console.error("ERROR: %o", error);
    process.exit(1);
  });
