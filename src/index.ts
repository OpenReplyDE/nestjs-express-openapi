export type { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
export type { DocsOptions } from "./docs-endpoint/index.js";
export type {
  ExpressJwtParams,
  ExpressJwtVerifierMiddlewareOptions,
} from "./express-jwt-verifier-middleware/index.js";
export type {
  ExpressOpenapiValidatorMiddlewareOptions,
  ExtendedOpenAPIV3,
} from "./express-openapi-validator-middleware/index.js";
export {
  OPENAPI_MIDDLEWARE,
  OpenapiMiddlewareModule,
} from "./nestjs-openapi-middleware/index.js";
export type * from "./openapi-typescript-utils/index.js";
export type { SwaggerUiOptions } from "./swagger-ui-endpoint/index.js";

import type { SecurityHandlers } from "express-openapi-validator/dist/framework/types.js";
export type SecurityHandler = SecurityHandlers[keyof SecurityHandlers];
