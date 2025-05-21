import { z } from "zod/v4";

export const DocsOptions = z.optional(
  z.union([z.literal(false), z.object({ path: z.string() })]),
);
export type DocsOptions = z.infer<typeof DocsOptions>;
