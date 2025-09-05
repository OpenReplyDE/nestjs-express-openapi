import type * as expressJwt from "express-jwt";
import { z } from "zod/v4";

import { DocsOptions } from "../docs-endpoint/validate-options.js";
import { ErrorHandlerMiddlewareOptions } from "../error-handler-middleware/validate-options.js";
import { ExpressJwtVerifierMiddlewareOptions } from "../express-jwt-verifier-middleware/index.js";
import {
  ExpressOpenapiValidatorMiddlewareOptions,
  type ExtendedOpenAPIV3,
} from "../express-openapi-validator-middleware/index.js";
import { NormalizeMediaTypesOptions } from "../openapi-media-type-normalizer-middleware/index.js";
import { SwaggerUiOptions } from "../swagger-ui-endpoint/index.js";

export const NestjsOpenapiMiddlewareOptions = z.object({
  apiSpec: z.any(),
  handleErrors: z.optional(ErrorHandlerMiddlewareOptions),
  jwtVerifier: z.optional(
    z.union([z.literal(false), ExpressJwtVerifierMiddlewareOptions]),
  ),
  normalizeMediaTypes: z.optional(NormalizeMediaTypesOptions),
  openapiValidator: z.optional(ExpressOpenapiValidatorMiddlewareOptions),
  serveOpenapiDocs: z.optional(DocsOptions),
  serveSwaggerUi: z.optional(SwaggerUiOptions),
});
export type NestjsOpenapiMiddlewareOptions = z.infer<
  typeof NestjsOpenapiMiddlewareOptions
> & {
  // This override needs to be done because the OpenAPI validator has its own validation
  apiSpec: ExtendedOpenAPIV3.DocumentV3 | ExtendedOpenAPIV3.DocumentV3_1;
  // This override needs to be done because the `secret` property needs to match an interface
  jwtVerifier?: expressJwt.Params | undefined;
  // This override needs to be done because of all the different function interfaces
  openapiValidator: Omit<ExpressOpenapiValidatorMiddlewareOptions, "apiSpec">;
};

export function validateOptions(
  data: unknown,
): data is NestjsOpenapiMiddlewareOptions {
  NestjsOpenapiMiddlewareOptions.parse(data);
  return true;
}
