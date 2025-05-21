import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import { z } from "zod/v4";

export const NormalizeMediaTypesOptions = z.boolean();
export type NormalizeMediaTypesOptions = z.infer<
  typeof NormalizeMediaTypesOptions
> & {
  apiSpec: OpenAPIV3.DocumentV3 | OpenAPIV3.DocumentV3_1;
};
