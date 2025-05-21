import { Get, HttpMethod, Simplify, ValueOf } from "./common.js";

type FlattenResponseObject<T> = [T] extends [never]
  ? {
      headers: Record<string, unknown> | undefined;
      contentType: never;
      responseBody: never;
    }
  : T extends { content: object }
    ? Simplify<
        { headers: Get<T, "headers"> } & ValueOf<{
          [C in keyof T["content"]]: {
            contentType: C;
            responseBody: T["content"][C];
          };
        }>
      >
    : never;

type FlattenOperationObject<T> = T extends {
  responses: object;
}
  ? ValueOf<{
      [S in keyof T["responses"]]: Simplify<
        {
          statusCode: S;
        } & FlattenResponseObject<T["responses"][S]>
      >;
    }>
  : never;

type FlattenPathItemObject<T> = T extends object
  ? ValueOf<{
      [M in HttpMethod & keyof T]: Simplify<
        {
          method: M;
        } & FlattenOperationObject<T[M]>
      >;
    }>
  : never;

/**
 * Represents type information for all responses in `PathsObject` selected by `Filter`
 */
export type Response<
  PathsObject,
  Filter extends {
    path?: string;
    method?: HttpMethod;
    statusCode?: number;
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
