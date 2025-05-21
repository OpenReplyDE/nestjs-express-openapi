import { z } from "zod/v4";

export const SwaggerUiOptions = z.object({
  path: z.string(),
  customCss: z.optional(z.string()),
  customCssUrl: z.optional(z.string()),
  customfavIcon: z.optional(z.string()),
  customJs: z.optional(z.string()),
  customSiteTitle: z.optional(z.string()),
  explorer: z.optional(z.boolean()),
  isExplorer: z.optional(z.boolean()),
  swaggerOptions: z.optional(z.object()),
  swaggerUrl: z.optional(z.string()),
  swaggerUrls: z.optional(z.array(z.string())),
});
export type SwaggerUiOptions = z.infer<typeof SwaggerUiOptions>;
