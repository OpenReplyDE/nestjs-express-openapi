import { RequestHandler, Router } from "express";
import { serve, setup } from "swagger-ui-express";
import { type ExtendedOpenAPIV3 } from "../express-openapi-validator-middleware/index.js";
import { SwaggerUiOptions } from "./validate-options.js";

export function createSwaggerUiEndpoint(
  options: SwaggerUiOptions,
  apiSpec: ExtendedOpenAPIV3.DocumentV3 | ExtendedOpenAPIV3.DocumentV3_1,
): RequestHandler {
  const router = Router();
  const { path, ...swaggerUiOptions } =
    typeof options === "string" ? { path: options } : options;
  router.use(path, serve).get(path, setup(apiSpec, swaggerUiOptions));
  return router;
}
