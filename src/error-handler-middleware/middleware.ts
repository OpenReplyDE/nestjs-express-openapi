import { type ErrorRequestHandler } from "express";

import { errorHandler } from "./error-handler.js";
import { ErrorHandlerMiddlewareOptions } from "./validate-options.js";

export function createErrorHandlerMiddleware(
  options: ErrorHandlerMiddlewareOptions,
): ErrorRequestHandler {
  return errorHandler(options === "verbose");
}
