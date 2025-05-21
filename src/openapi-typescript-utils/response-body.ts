import { HttpMethod } from "./common.js";
import { Response } from "./response.js";

/**
 * Type of the response body for a subset of the responses in `PathsObject` as selected by `Filter`.
 */
export type ResponseBody<
  PathsObject,
  Filter extends {
    path?: string;
    method?: HttpMethod;
    statusCode?: number;
    contentType?: string;
  } = object,
> = Response<PathsObject, Filter>["responseBody"];
