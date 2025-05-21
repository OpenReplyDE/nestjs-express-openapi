export type Get<
  T,
  K extends symbol | string | number,
  U = never,
> = K extends keyof T ? T[K] : U;

export type ValueOf<T> = T[keyof T];

export type HttpMethod =
  | "get"
  | "put"
  | "post"
  | "delete"
  | "options"
  | "head"
  | "patch"
  | "trace";

export type Simplify<T extends unknown[] | object> = {
  [K in keyof T]: T[K];
} & {};
