import { type RequestHandler, Router } from "express";
import * as OpenApiValidator from "express-openapi-validator";
import { ExpressOpenapiValidatorMiddlewareOptions } from "./validate-options.js";

export function middlewareOpenApiRouter(
  options: ExpressOpenapiValidatorMiddlewareOptions,
): RequestHandler {
  const router = Router();

  router.use(
    ...OpenApiValidator.middleware({
      validateApiSpec: true,
      validateRequests: true,
      validateResponses: true,
      validateSecurity: true,
      validateFormats: true,
      ignoreUndocumented: false,
      ...options,
    }),
  );

  return router;
}
