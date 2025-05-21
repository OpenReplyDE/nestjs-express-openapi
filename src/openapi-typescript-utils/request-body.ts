import { HttpMethod } from "./common.js";
import { Request } from "./request.js";

/**
 * Type of the request body for a subset of the requests in `PathsObject` as selected by `Filter`.
 */
export type RequestBody<
  PathsObject,
  Filter extends {
    path?: string;
    method?: HttpMethod;
    contentType?: string;
  } = object,
> = Request<PathsObject, Filter>["requestBody"];
