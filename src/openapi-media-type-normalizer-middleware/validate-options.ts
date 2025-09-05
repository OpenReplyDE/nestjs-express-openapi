import { z } from "zod/v4";
import { ExtendedOpenAPIV3 } from "../express-openapi-validator-middleware/index.js";

export const NormalizeMediaTypesOptions = z.boolean();
export type NormalizeMediaTypesOptions = z.infer<
  typeof NormalizeMediaTypesOptions
> & {
  apiSpec: ExtendedOpenAPIV3.DocumentV3 | ExtendedOpenAPIV3.DocumentV3_1;
};
