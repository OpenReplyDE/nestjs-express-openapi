import { KeyObject } from "node:crypto";

import { z } from "zod/v4";

const KeyObjectType = z.custom<KeyObject>(
  (data: unknown) => data instanceof KeyObject,
);

const Secret = z.union([
  z.string(),
  z.instanceof(Buffer),
  KeyObjectType,
  z.object({
    key: z.union([z.string(), z.instanceof(Buffer)]),
    passphrase: z.string(),
  }),
]);

const Algorithm = z.union([
  z.literal("HS256"),
  z.literal("HS384"),
  z.literal("HS512"),
  z.literal("RS256"),
  z.literal("RS384"),
  z.literal("RS512"),
  z.literal("ES256"),
  z.literal("ES384"),
  z.literal("ES512"),
  z.literal("PS256"),
  z.literal("PS384"),
  z.literal("PS512"),
  z.literal("none"),
]);

export const ExpressJwtVerifierMiddlewareOptions = z.object({
  secret: z.union([Secret, z.instanceof(Function)]),
  getToken: z.optional(z.instanceof(Function)),
  isRevoked: z.optional(z.instanceof(Function)),
  credentialsRequired: z.optional(z.boolean()),
  requestProperty: z.optional(z.string()),
  algorithms: z.array(Algorithm),
  onExpired: z.optional(z.instanceof(Function)),
  audience: z.optional(
    z.union([
      z.string(),
      z.instanceof(RegExp),
      z.array(z.union([z.string(), z.instanceof(RegExp)])),
    ]),
  ),
  clockTimestamp: z.optional(z.number()),
  clockTolerance: z.optional(z.number()),
  complete: z.optional(z.boolean()),
  issuer: z.optional(z.union([z.string(), z.array(z.string())])),
  ignoreExpiration: z.optional(z.boolean()),
  ignoreNotBefore: z.optional(z.boolean()),
  jwtid: z.optional(z.string()),
  nonce: z.optional(z.string()),
  subject: z.optional(z.string()),
  maxAge: z.optional(z.union([z.string(), z.number()])),
  allowInvalidAsymmetricKeyTypes: z.optional(z.boolean()),
});
export type ExpressJwtVerifierMiddlewareOptions = z.infer<
  typeof ExpressJwtVerifierMiddlewareOptions
>;
