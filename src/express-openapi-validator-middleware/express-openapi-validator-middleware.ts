import { RequestHandler } from "express";

import { middlewareOpenApiRouter } from "./middleware-openapi-router.js";
import { ExpressOpenapiValidatorMiddlewareOptions } from "./validate-options.js";

export function createExpressOpenapiValidatorMiddleware(
  options: ExpressOpenapiValidatorMiddlewareOptions,
): RequestHandler {
  return middlewareOpenApiRouter(options);
}
