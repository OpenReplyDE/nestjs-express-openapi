import { HttpMethod } from "./common.js";
import { Response } from "./response.js";

/**
 * Type of the response headers for a subset of the responses in `PathsObject` as selected by `Filter`.
 */
export type ResponseHeaders<
  PathsObject,
  Filter extends {
    path?: string;
    method?: HttpMethod;
    statusCode?: number;
  } = object,
> = Response<PathsObject, Filter>["headers"];
