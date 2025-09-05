import { NestFactory } from "@nestjs/core";
import { OPENAPI_MIDDLEWARE } from "@openreplyde/nestjs-express-openapi";
import { json, type RequestHandler } from "express";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Body parsing is done by express middleware
    bodyParser: false,
  });

  app.use(
    // Install a JSON body parser
    // This one is provided by express, but you can use a different one
    // or additional ones (for msgpack for example) if you like as long
    // as you install them before the validator middleware
    json({ type: ["json", "*/*+json"] }),
    app.get<RequestHandler>(OPENAPI_MIDDLEWARE),
  );
  await app.listen(3000);
}
bootstrap();
