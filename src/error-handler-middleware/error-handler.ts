import { ErrorRequestHandler } from "express";
import * as OpenApiValidator from "express-openapi-validator";

export function errorHandler(verbose: boolean): ErrorRequestHandler {
  return (error, _req, res, next) => {
    if (
      error instanceof OpenApiValidator.error.InternalServerError ||
      error instanceof OpenApiValidator.error.UnsupportedMediaType ||
      error instanceof OpenApiValidator.error.RequestEntityTooLarge ||
      error instanceof OpenApiValidator.error.BadRequest ||
      error instanceof OpenApiValidator.error.MethodNotAllowed ||
      error instanceof OpenApiValidator.error.NotAcceptable ||
      error instanceof OpenApiValidator.error.NotFound ||
      error instanceof OpenApiValidator.error.Unauthorized ||
      error instanceof OpenApiValidator.error.Forbidden
    ) {
      res
        .status(error.status)
        .set(error.headers ?? {})
        .json({
          message: error.message,
          status: error.status,
          errors: error.errors,
          ...(verbose && {
            stack: error.stack,
            cause: error.cause,
            path: error.path,
          }),
        });
    } else {
      next(error);
    }
  };
}
