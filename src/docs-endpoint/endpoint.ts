import {
  type Request,
  type RequestHandler,
  type Response,
  Router,
} from "express";

import type { ExtendedOpenAPIV3 } from "../express-openapi-validator-middleware/index.js";

import { DocsOptions } from "./validate-options.js";

export function createDocsEndpoint(
  options: DocsOptions,
  apiSpec: ExtendedOpenAPIV3.DocumentV3 | ExtendedOpenAPIV3.DocumentV3_1,
): RequestHandler {
  const router = Router();
  if (!options) {
    return router;
  }
  const response = JSON.stringify(apiSpec);
  router.get(options.path, [
    (_req: Request, res: Response) => {
      res.type("json").send(response);
    },
  ]);
  return router;
}
