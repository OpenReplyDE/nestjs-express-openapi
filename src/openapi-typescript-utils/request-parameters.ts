import { HttpMethod } from "./common.js";
import { Request } from "./request.js";

/**
 * Type of the request parameters for a subset of the requests in `PathsObject` as selected by `Filter`.
 */
export type RequestParameters<
  PathsObject,
  Filter extends {
    path?: string;
    method?: HttpMethod;
  } = object,
> = Request<PathsObject, Filter>["parameters"];
