import { HttpMethod } from "./common.js";
import { RequestParameters } from "./request-parameters.js";

/**
 * Type of the request headers for a subset of the requests in `PathsObject` as selected by `Filter`.
 */
export type RequestHeaders<
  PathsObject,
  Filter extends { path?: string; method?: HttpMethod } = object,
> = RequestParameters<PathsObject, Filter>["header"];
