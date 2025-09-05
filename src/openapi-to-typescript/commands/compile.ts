import type { OpenAPI3 } from "openapi-typescript";

import { CommandModule } from "yargs";

function commandModule<T = object, U extends T = T>(
  module: CommandModule<T, U>,
): CommandModule<T, U> {
  return module;
}

async function ensureDir(filename: string) {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");

  const dir = path.dirname(filename);
  await fs.mkdir(dir, { recursive: true });
}

export const compileCommandModule = commandModule({
  command: "compile [input] [output]",
  describe: "Compile an OpenAPI specification to TypeScript",
  builder(yargs) {
    return yargs
      .positional("input", {
        type: "string",
        desc: "filename of the OpenAPI specification file (JSON or YAML)",
        demandOption: true,
      })
      .option("output", {
        type: "string",
        desc: "filename of the generated TypeScript file",
        demandOption: true,
      })
      .option("validate", {
        type: "boolean",
        desc: "validate the OpenAPI specification",
        default: true,
      })
      .option("additional-properties", {
        type: "boolean",
        desc: "allow arbitrary properties on objects unless 'additionalProperties: false' is specified",
        default: false,
      })
      .option("alphabetize", {
        type: "boolean",
        desc: "sort types alphabetically",
        default: false,
      })
      .option("exclude-deprecated", {
        type: "boolean",
        desc: "exclude deprecated fields from types",
        default: false,
      })
      .option("support-array-length", {
        type: "boolean",
        desc: "generated tuples using 'minItems' / 'maxItems'",
        default: false,
      })
      .option("path-params-as-types", {
        type: "boolean",
        desc: "allow dynamic string lookups on the 'paths' object",
        default: false,
      })
      .option("export-type", {
        type: "boolean",
        desc: "export 'type' instead of 'interface'",
        default: false,
      })
      .option("default-non-nullable", {
        type: "boolean",
        desc: "treat schema objects with default values as non-nullable",
        default: false,
      })
      .option("empty-objects-unknown", {
        type: "boolean",
        desc: "allow arbitrary properties for schema objects with no specified properties, and no specified 'additionalProperties'",
        default: false,
      })
      .option("immutable-exports", {
        type: "boolean",
        desc: "whether to export API specification as immutable object",
        default: false,
      });
  },
  async handler(args) {
    const fs = await import("node:fs/promises");

    const { default: openapiTS, astToString } = await import(
      "openapi-typescript"
    );
    const { default: SwaggerParser } = await import(
      "@apidevtools/swagger-parser"
    );

    const apiSpec = await SwaggerParser.bundle(args.input, {
      parse: {
        json: { allowEmpty: false },
        text: { allowEmpty: true, canParse: ".txt" },
        yaml: { allowEmpty: false },
      },
      resolve: {
        external: true,
        file: {
          canRead: true,
        },
        http: false,
      },
      validate: {
        schema: args.validate,
        spec: args.validate,
      },
    });

    let code = `import type {
  CookieParameters as LibCookieParameters,
  HttpMethod,
  ExtendedOpenAPIV3,
  PathParameters  as LibPathParameters,
  QueryParameters as LibQueryParameters,
  RequestBody as LibRequestBody,
  RequestHeaders as LibRequestHeaders,
  ResponseBody as LibResponseBody,
  ResponseHeaders as LibResponseHeaders,
} from '@openreplyde/nestjs-express-openapi';

${astToString(
  await openapiTS(apiSpec as OpenAPI3, {
    additionalProperties: args["additional-properties"],
    alphabetize: args.alphabetize,
    excludeDeprecated: args["exclude-deprecated"],
    pathParamsAsTypes: args["path-params-as-types"],
    exportType: args["export-type"],
    defaultNonNullable: args["default-non-nullable"],
    emptyObjectsUnknown: args["empty-objects-unknown"],
  }),
)}

export type CookieParameters<
  Filter extends { path?: string; method?: HttpMethod } = object,
> = LibCookieParameters<paths, Filter>

export type PathParameters<
  Filter extends { path?: string; method?: HttpMethod } = object,
> = LibPathParameters<paths, Filter>

export type QueryParameters<
  Filter extends { path?: string; method?: HttpMethod } = object,
> = LibQueryParameters<paths, Filter>

export type RequestBody<
  Filter extends {
    path?: string;
    method?: HttpMethod;
    contentType?: string;
  } = object,
> = LibRequestBody<paths, Filter>

export type RequestHeaders<
  Filter extends { path?: string; method?: HttpMethod } = object,
> = LibRequestHeaders<paths, Filter>

export type ResponseBody<
  Filter extends {
    path?: string;
    method?: HttpMethod;
    statusCode?: number;
    contentType?: string;
  } = object,
> = LibResponseBody<paths, Filter>

export type ResponseHeaders<
  Filter extends {
    path?: string;
    method?: HttpMethod;
    statusCode?: number;
  } = object,
> = LibResponseHeaders<paths, Filter>

/** OpenAPI specification */
export const apiSpec: ExtendedOpenAPIV3.DocumentV3 | ExtendedOpenAPIV3.DocumentV3_1  = ${JSON.stringify(apiSpec)}${
      args["immutable-exports"] ? " as const" : ""
    };\n`;

    const prettier = await import("prettier");
    code = await prettier.format(code, {
      filepath: "intermediate-openapi.ts",
    });

    await ensureDir(args.output);
    await fs.writeFile(args.output, code, "utf-8");
  },
});
