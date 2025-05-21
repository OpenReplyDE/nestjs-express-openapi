import {
  ClassProvider,
  DynamicModule,
  ExistingProvider,
  FactoryProvider,
  Module,
  ModuleMetadata,
  ValueProvider,
} from "@nestjs/common";

import { createExpressOpenapiMiddleware } from "./middleware.js";
import { NestjsOpenapiMiddlewareOptions } from "./validate-options.js";

export const OPENAPI_MIDDLEWARE_OPTIONS = Symbol("OPENAPI_MIDDLEWARE_OPTIONS");
export const OPENAPI_MIDDLEWARE = Symbol("OPENAPI_VALIDATOR_MIDDLEWARE");

@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: This needs to be static-only for NestJS
export class OpenapiMiddlewareModule {
  static register(options: NestjsOpenapiMiddlewareOptions): DynamicModule {
    return OpenapiMiddlewareModule.registerAsync({
      useValue: options,
    });
  }

  static registerAsync({
    imports,
    providers,
    ...provider
  }: (
    | Omit<ClassProvider<NestjsOpenapiMiddlewareOptions>, "provide">
    | Omit<ValueProvider<NestjsOpenapiMiddlewareOptions>, "provide">
    | Omit<FactoryProvider<NestjsOpenapiMiddlewareOptions>, "provide">
    | Omit<ExistingProvider<NestjsOpenapiMiddlewareOptions>, "provide">
  ) &
    Pick<ModuleMetadata, "imports" | "providers">): DynamicModule {
    return {
      module: OpenapiMiddlewareModule,
      imports,
      providers: [
        ...(providers ?? []),
        {
          ...provider,
          provide: OPENAPI_MIDDLEWARE_OPTIONS,
        },
        {
          provide: OPENAPI_MIDDLEWARE,
          inject: [OPENAPI_MIDDLEWARE_OPTIONS],
          useFactory(options: NestjsOpenapiMiddlewareOptions) {
            return createExpressOpenapiMiddleware(options);
          },
        },
      ],
      exports: [OPENAPI_MIDDLEWARE],
    };
  }
}
