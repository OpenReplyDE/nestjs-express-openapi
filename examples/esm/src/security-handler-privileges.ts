import assert from "node:assert";
import type {
  OpenAPIV3,
  SecurityHandler,
} from "@openreplyde/nestjs-express-openapi";
import type * as Express from "express";
import { error } from "express-openapi-validator";
import { z } from "zod/v4";

const JwtSecurityScheme = z.object({
  type: z.literal("http"),
  scheme: z.literal("bearer"),
  bearerFormat: z.literal("JWT"),
});

const ReqWithJwt = z.object({
  auth: z.object({
    privileges: z.array(z.string()),
  }),
});

function isOfZodType<T extends z.ZodType>(
  schema: T,
  data: unknown,
): data is z.infer<T> {
  return schema.safeParse(data).success;
}

/**
 * A custom security handler for use with `express-openapi-validator`.
 *
 * Checks if the specified minimum privileges are a subset of the `privileges` claim.
 */
export const requireAllPrivileges: SecurityHandler = (
  req: Pick<Express.Request, "path">,
  specifiedPrivileges: string[],
  schema: OpenAPIV3.SecuritySchemeObject,
): boolean => {
  assert(isOfZodType(JwtSecurityScheme, schema), "Invalid security scheme");

  if (!isOfZodType(ReqWithJwt, req)) {
    return false;
  }

  if (
    !specifiedPrivileges.every((privilege) =>
      req.auth.privileges.includes(privilege),
    )
  ) {
    throw new error.Forbidden({
      path: req.path,
      message: "You have insufficient privileges to access this resource",
    });
  }

  return true;
};
