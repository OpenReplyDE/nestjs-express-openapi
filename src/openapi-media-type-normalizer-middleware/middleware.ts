import { NextFunction, Request, RequestHandler, Response } from "express";
import { normalizeRequestHeaderTypes } from "./normalize-request.js";

type CreateExpressOpenapiMiddleware = () => RequestHandler;

export const createOpenapiMediaTypeNormalizerMiddleware: CreateExpressOpenapiMiddleware =
  () => (req: Request, _res: Response, next: NextFunction) => {
    normalizeRequestHeaderTypes(req);
    next();
  };
