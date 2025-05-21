import express from "express";
import * as expressJwt from "express-jwt";

export function createExpressJwtVerifierMiddleware(
  options: expressJwt.Params,
): express.RequestHandler {
  return express.Router().use(
    expressJwt.expressjwt({
      credentialsRequired: options.credentialsRequired ?? false,
      ...options,
    }),
    (
      err: unknown,
      req: expressJwt.Request,
      _res: express.Response,
      next: express.NextFunction,
    ) => {
      if (err instanceof expressJwt.UnauthorizedError) {
        // If the token is invalid it should behave as if there was no token
        req.auth = undefined;
        next();
      } else {
        next(err);
      }
    },
  );
}
