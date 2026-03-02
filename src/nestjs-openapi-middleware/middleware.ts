import { RequestHandler, Router } from "express";
import { createDocsEndpoint } from "../docs-endpoint/endpoint.js";
import { createErrorHandlerMiddleware } from "../error-handler-middleware/middleware.js";
import { createExpressJwtVerifierMiddleware } from "../express-jwt-verifier-middleware/index.js";
import { createExpressOpenapiValidatorMiddleware } from "../express-openapi-validator-middleware/index.js";
import {
  createOpenapiMediaTypeNormalizerMiddleware,
  normalizeApiSpec,
} from "../openapi-media-type-normalizer-middleware/index.js";
import { createSwaggerUiEndpoint } from "../swagger-ui-endpoint/endpoint.js";
import {
  NestjsOpenapiMiddlewareOptions,
  validateOptions,
} from "./validate-options.js";

type CreateExpressOpenapiMiddleware = (
  options: NestjsOpenapiMiddlewareOptions,
) => RequestHandler;

export const createExpressOpenapiMiddleware: CreateExpressOpenapiMiddleware = (
  options: NestjsOpenapiMiddlewareOptions,
) => {
  validateOptions(options);
  const router = Router();

  const originalApiSpec = options.apiSpec._originalApiSpec ?? options.apiSpec;

  let apiSpec = { ...options.apiSpec };
  delete apiSpec._originalApiSpec;

  if (options.normalizeMediaTypes) {
    apiSpec = normalizeApiSpec(options.apiSpec);
    router.use(createOpenapiMediaTypeNormalizerMiddleware());
  }

  if (options.serveOpenapiDocs) {
    router.use(createDocsEndpoint(options.serveOpenapiDocs, originalApiSpec));
  }

  if (options.serveSwaggerUi) {
    router.use(
      createSwaggerUiEndpoint(options.serveSwaggerUi, originalApiSpec),
    );
  }

  if (options.jwtVerifier) {
    router.use(createExpressJwtVerifierMiddleware(options.jwtVerifier));
  }

  router.use(
    createExpressOpenapiValidatorMiddleware({
      ...options.openapiValidator,
      apiSpec,
    }),
  );

  const handleErrors =
    options.handleErrors === undefined ? true : options.handleErrors;
  if (handleErrors) {
    router.use(createErrorHandlerMiddleware(handleErrors));
  }

  return router;
};
