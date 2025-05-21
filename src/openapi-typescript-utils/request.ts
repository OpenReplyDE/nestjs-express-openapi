import { Get, HttpMethod, Simplify, ValueOf } from "./common.js";

type GetParameters<T> = T extends {
  parameters: object;
}
  ? {
      parameters: {
        query: Get<T["parameters"], "query">;
        header: Get<T["parameters"], "header">;
        path: Get<T["parameters"], "path">;
        cookie: Get<T["parameters"], "cookie">;
      };
    }
  : { parameters: { query: never; header: never; path: never; cookie: never } };

type GetRequestBodies<T> = T extends {
  requestBody: { content: object };
}
  ? ValueOf<{
      [C in keyof T["requestBody"]["content"]]: {
        contentType: C;
        requestBody: T["requestBody"]["content"][C];
      };
    }>
  : { contentType: never; requestBody: never };

type FlattenPathItemObject<T> = ValueOf<{
  [M in HttpMethod & keyof T]: Simplify<
    {
      method: M;
    } & GetParameters<T[M]> &
      GetRequestBodies<T[M]>
  >;
}>;

/**
 * Represents type information for all requests in `PathsObject` selected by `Filter`
 */
export type Request<
  PathsObject,
  Filter extends {
    path?: string;
    method?: HttpMethod;
    contentType?: string;
  } = object,
> = Simplify<
  ValueOf<{
    [P in keyof PathsObject]: Simplify<
      { path: P } & FlattenPathItemObject<PathsObject[P]>
    >;
  }> &
    Filter
>;
