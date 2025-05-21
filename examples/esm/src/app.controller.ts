import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Res,
} from "@nestjs/common";
import type {
  PathParameters,
  QueryParameters,
  RequestBody,
  // RequestHeaders, // There is no example here for it but it is used the same way as RequestBody. It ensures types of specified request headers.
  ResponseBody,
} from "@openreplyde/nestjs-express-openapi";
import { type Response } from "express";

import type { paths } from "../generated/openapi.js";
import { AppService } from "./app.service.js";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/greetings")
  async getHello(
    @Query()
    query: QueryParameters<paths, { method: "get"; path: "/greetings" }>,
  ): Promise<
    ResponseBody<paths, { method: "get"; path: "/greetings"; status: 200 }>
  > {
    return this.appService.getHello(query?.name ?? "World");
  }

  @Post("/authentications")
  async authentications(
    @Headers("content-type") contentType: string,
    @Query()
    query: QueryParameters<paths, { method: "post"; path: "/authentications" }>,
    @Body()
    body: RequestBody<
      paths,
      {
        method: "post";
        path: "/authentications";
      }
    >,
    @Res() res: Response,
  ): Promise<void> {
    // content negotiation is a bit cumbersome yet:
    if (contentType === "application/x.credentials.v1+json") {
      const credentials: RequestBody<
        paths,
        {
          method: "post";
          path: "/authentications";
          contentType: "application/x.credentials.v1+json";
        }
        // biome-ignore lint/suspicious/noExplicitAny: Testing for the content-type header actually ensures the correct type
      > = body as any;
      if (
        !(credentials.username === "user" && credentials.password === "pass")
      ) {
        // Unfortunately, you cannot use `throw new UnauthorizedException();`.
        // You need to create the response with express yourself:
        res.status(401).send();
      }
    } else {
      const credentials: RequestBody<
        paths,
        {
          method: "post";
          path: "/authentications";
          contentType: "application/x.credentials.v2+json";
        }
        // biome-ignore lint/suspicious/noExplicitAny: Testing for the content-type header actually ensures the correct type
      > = body as any;
      if (!(credentials.user === "user" && credentials.pass === "pass")) {
        // Unfortunately, you cannot use `throw new UnauthorizedException();`.
        // You need to create the response with express yourself:
        res.status(401).send();
      }
    }

    const accessToken = this.appService.createToken(query?.privileges ?? []);
    const result: ResponseBody<
      paths,
      { method: "post"; path: "/authentications"; status: 200 }
    > = {
      access_token: accessToken,
      scheme: "bearer",
    };
    // Once you get a Response object with @Res(), you cannot return the
    // response object any more. You need to send it with express yourself:
    res.status(200).send(JSON.stringify(result));
  }

  @Get("/dates/:time")
  async getDate(
    @Param()
    params: PathParameters<paths, { method: "get"; path: "/dates/{time}" }>,
  ): Promise<
    ResponseBody<paths, { method: "get"; path: "/dates/{time}"; status: 200 }>
  > {
    const nowUnixMilliseconds = new Date().getTime();

    const date =
      params.time === "yesterday"
        ? nowUnixMilliseconds - 24 * 60 * 60 * 1000
        : nowUnixMilliseconds;

    return { date: new Date(date).toISOString().split("T")[0] };
  }
}
