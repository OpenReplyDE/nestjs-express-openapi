import { HttpMethod } from "./common.js";
import { RequestParameters } from "./request-parameters.js";

/**
 * Type of the path parameters for a subset of the requests in `PathsObject` as selected by `Filter`.
 */
export type PathParameters<
  PathsObject,
  Filter extends { path?: string; method?: HttpMethod } = object,
> = RequestParameters<PathsObject, Filter>["path"];
