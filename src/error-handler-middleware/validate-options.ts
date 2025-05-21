import { z } from "zod/v4";

export const ErrorHandlerMiddlewareOptions = z.optional(
  z.union([z.boolean(), z.literal("verbose")]),
);
export type ErrorHandlerMiddlewareOptions = z.infer<
  typeof ErrorHandlerMiddlewareOptions
>;
