import { RequestHandler, Router } from "express";
import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import { serve, setup } from "swagger-ui-express";

import { SwaggerUiOptions } from "./validate-options.js";

export function createSwaggerUiEndpoint(
  options: SwaggerUiOptions,
  apiSpec: OpenAPIV3.DocumentV3 | OpenAPIV3.DocumentV3_1,
): RequestHandler {
  const router = Router();
  const { path, ...swaggerUiOptions } =
    typeof options === "string" ? { path: options } : options;
  router.use(path, serve).get(path, setup(apiSpec, swaggerUiOptions));
  return router;
}
