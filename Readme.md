# NestJS Express OpenAPI Code Generator and Utilities

This package provides you means to use NestJS with an API-first approach.
It provides you

- types for your DTOs for usage in controllers
- request validation middleware
- response validation middleware
- authorization middleware to verify JWT

It is based on the following third party packages

- [`openapi-typescript`](https://www.npmjs.com/package/openapi-typescript) to compile the openapi.yaml to TypeScript types
- [`express-openapi-validator`](https://www.npmjs.com/package/express-openapi-validator) to validate requests and responses against the openapi.yaml
- [`express-jwt`](https://www.npmjs.com/package/express-jwt) to verify JWT signatures
- [`swagger-ui-express`](https://www.npmjs.com/package/swagger-ui-express) to provide an endpoint that serves the OpenAPI spec as JSON and to serve a Swagger UI

[TOC]

# Installation

Install the package with

```bash
npm i -S @openreplyde/nestjs-express-openapi
```

First, write a regular `openapi.yaml` and place it next to your NestJS application's `package.json`.
Then add the following scripts to your `package.json`:
```json
{
  "scripts": {
    "generate": "openapi-to-typescript compile openapi.yaml generated/openapi.ts"
  }
}
```
And run `npm run generate`.
This will compile the `openapi.yaml` to the `generated/openapi.ts` which gives you TypeScript types.

Then, configure the middlewares for OpenAPI and, if needed, JWT in your `app.module.ts`:
```ts
import { Module } from '@nestjs/common';
import { OpenapiMiddlewareModule } from '@openreplyde/nestjs-express-openapi';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { requireAllPrivileges } from './security-handler-privileges.js';

// Import the bundled API specification from the generated file
import { apiSpec } from '../generated/openapi.js';

@Module({
  imports: [
    OpenapiMiddlewareModule.register({
      apiSpec,
      jwtVerifier: { // optional JWT signature verification
        // DO NOT USE this config for production. Use more secure settings like "RS512" with a key pair
        secret: 'my-secret',
        algorithms: ['HS512'],
      },
      openapiValidator: {
        validateSecurity: { // optional JWT payload validation
          handlers: {
            // the keys of this object must match the `securitySchemes` names in the openapi.yaml
            // see the example in the examples/esm/ directory
            requireAllPrivileges: (req, res, next) => { /* do some checks here */ return true /* or false */ },
          },
        },
      },
      normalizeMediaTypes: false, // optionally normalize media types
      docs: { path: '/api-docs' }, // optional endpoint to serve the OpenAPI specification as JSON
      swaggerUi: { path: '/swagger-ui' }, // optional endpoint to serve the Swagger UI
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

Finally, activate the middlewares in the `main.ts` that holds your `bootstrap()` function:
```ts
import { NestFactory } from '@nestjs/core';
import { OPENAPI_MIDDLEWARE } from '@openreplyde/nestjs-express-openapi';
import { type RequestHandler, json } from 'express';
import { AppModule } from './app.module';

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
    json({ type: ['json', '*/*+json'] }),
    app.get<RequestHandler>(OPENAPI_MIDDLEWARE),
  );
  await app.listen(3000);
}
bootstrap();
```

This activates request and response validation.
No need for class-validator or class-transformer.
No need for guards that check for json web token clams.

You can use the Type utilities to get easier access to the generated types.

# Options

## `apiSpec` (Required)
This is the openapi.yaml as a structured type.
You can just pass the generated specification from the above mentioned `generate` script.

## `jwtVerifier` (Optional)
If set, each request that is annotated with `security` will be checked for a valid signature in its JWT.
By default, it assumes a JWT to be in the `Authorization` header, prefixed with `Bearer `.
On successful verification, the payload will be set in `req.auth`.
On unsuccessful verification, it will deny the request.

## `openapiValidator` (Optional)
The OpenAPI validating middleware is always active.
Each request and each response will be validated against the API specification by default.
You can pass the options of the [`express-openapi-validator`](https://www.npmjs.com/package/express-openapi-validator) directly here.
Note that the `apiSpec` is already passed to the `express-openapi-validator` by this module.
Note also that this default configuration is set:
```ts
{
  validateApiSpec: true,
  validateRequests: true,
  validateResponses: true,
  validateSecurity: true,
  validateFormats: true,
  ignoreUndocumented: false,
}
```

### `openapiValidator.validateSecurity.handlers` (Optional)

If you enable the jwtVerifier, you might also want to enable security handlers.
These check each request that is annotated with `security` for a matching JWT payload in the middleware.
This can be set up with `openapiValidator.validateSecurity.handlers` in a central place.

See the example applications in [`examples/`](examples/) for security handlers that check the JWT payload for custom features.

## `normalizeMediaTypes` (Optional)
If set to `true`, this will modify your OpenAPI specification that is used for validation and will modify each request's Accept/Content-Type headers to have normalized media types:

Example of such modifications:
- adding spaces for parameters: `application/vnd.foo.fetch+json;version=1` => `application/vnd.foo.fetch+json; version=1`

Some HTTP clients normalize the media types when they send requests without developers having a way to change it.
Since the validation logic of the middleware compares these for equality, such client-side modifications can break functionality.
If you want to support such clients that normalize before sending the request, enable this option.

Be aware that the modified specification only affects the internal validation logic but not the generated types in `openapi.ts`.
Be aware that the actual requests and responses are modified.

## `docs` (Optional)
This option sets up an endpoint to serve the OpenAPI specification as JSON.
If you set `docs: { path: "/api-docs" }` you can fetch the API spec:
```bash
❯ curl 'localhost:3000/api-docs'
# => {"openapi":"3.1.0","info":{"title":"api-first-project","summary":...
```

## `swaggerUi` (Optional)
If you set `swaggerUi: { path: '/swagger-ui' }`, a HTML representation of the API documentation (Swagger UI) is served at [/swagger-ui](http://localhost:3000/swagger-ui).
The `swaggerUi` option accepts all options of the [`swagger-ui-express`](https://www.npmjs.com/package/swagger-ui-express) package.


# Type Utilities

Use the provided type utilities to extract the types from the `generated/openapi.ts`:
```ts
import type {
  PathParameters,
  QueryParameters,
  RequestBody,
  RequestHeaders,
  ResponseBody,
  ResponseHeaders,
} from '@openreplyde/nestjs-express-openapi';
```

They all function basically the same: They take the `paths` object and a qualifier as type arguments and give you the corresponding type. Examples are:

This type will give you the query parameters that are specified at `GET /greetings`:
```ts
type GetDatesQuery = QueryParameters<paths, { method: 'get'; path: '/greetings' }>;
/* => type GetDatesQuery = {
    name?: string;
} | undefined */
```

This type will give you the path parameters that are specified at `GET /dates/{time}`:
```ts
type GetDatesParams = PathParameters<paths, { method: 'get'; path: '/dates/{time}' }>;
/* => type GetDatesParams = {
    time: "today" | "yesterday";
} */
```

Note that the `RequestBody` requires an additional `contentType` property:
This type will give you the request body type that is specified at `POST /authentications` for the `application/x.credentials.v1+json` request-content-type:
```ts
type AuthenticationBody = RequestBody<paths, { method: 'post'; path: '/authentications'; contentType: 'application/x.credentials.v1+json' }>;
/* => type AuthenticationBody = {
    username: string;
    password: string;
} */
```

Please also note that `ResponseBody` requires a `status` property in the second type argument:
```ts
type TokenResponse = ResponseBody< paths, { method: 'post'; path: '/authentications'; status: 200 } >;
/* => type TokenResponse = {
    access_token: string;
    scheme: "bearer";
} */
```

# Example Code

See the [`examples/`](examples/) directory for full example NestJS applications.
One application is built for CommonJS with the regular tools for NestJS.
The other is built for ESM using SWC and allows you to use the modern JavaScript type system and hence use the most modern npm packages.

In any of the examples, run `npm ci` and `npm run generate` to compile the `generated/openapi.ts`.
Then, run `npm run build` and `npm run start` to start the application.

You can send requests like the following to test the controllers:
```shell
curl 'localhost:3000/greetings'
# => Hello, World!

curl 'localhost:3000/greetings?name=Alice'
# => Hello, Alice!

curl -i -X 'POST' \
  'http://localhost:3000/authentications?privileges=date%3aread&privileges=date%3awrite&privileges=test' \
  -H 'accept: application/x.access-token.v1+json' \
  -H 'Content-Type: application/x.credentials.v1+json' \
  -d '{
  "username": "user",
  "password": "pass"
}'
# =>
# HTTP/1.1 200 OK
# X-Powered-By: Express
# Content-Type: text/html; charset=utf-8
# Content-Length: 271
# ETag: W/"10f-lV3R+oO7LYT+4FGAy3uRUZn6tWk"
# Date: Mon, 12 May 2025 19:49:07 GMT
# Connection: keep-alive
# Keep-Alive: timeout=5
#
# {"access_token":"eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NDcwNzkzNDcsImV4cCI6MTc0NzExNTM0NywicHJpdmlsZWdlcyI6WyJkYXRlOnJlYWQiLCJkYXRlOndyaXRlIiwidGVzdCJdfQ.Rtm8nPo9T25MrRUHlQKGiWKoYCFcMu5oJ-41bZZ6S_uiKS4cEG7DJEonHSmBSodHIMpUxYDGbsg7wy3I2eZWBQ","scheme":"bearer"}

curl -i -X 'POST' \
  'http://localhost:3000/authentications?privileges=date%3aread&privileges=date%3awrite&privileges=test' \
  -H 'accept: application/x.access-token.v1+json' \
  -H 'Content-Type: application/x.credentials.v2+json' \
  -d '{
  "user": "user",
  "pass": "pass"
}'
# =>
# HTTP/1.1 200 OK
# X-Powered-By: Express
# Content-Type: text/html; charset=utf-8
# Content-Length: 271
# ETag: W/"10f-ogAvCUyaRBOhd0wecjp3M1jfs8Q"
# Date: Mon, 12 May 2025 19:49:42 GMT
# Connection: keep-alive
# Keep-Alive: timeout=5
#
# {"access_token":"eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NDcwNzkzODIsImV4cCI6MTc0NzExNTM4MiwicHJpdmlsZWdlcyI6WyJkYXRlOnJlYWQiLCJkYXRlOndyaXRlIiwidGVzdCJdfQ.NupQ-iKf5oQOTjnLnU-YWTnh3KWPcy7EHzqmK0dyG1kwl8Jb_2kuypxUj_Qofy8QMZw_HBVyWsvQzCakoLSKIg","scheme":"bearer"}

# this should give you a HTTP 400:
❯ curl -i -X 'POST' \
  'http://localhost:3000/authentications?privileges=date%3aread&privileges=date%3awrite&privileges=test' \
  -H 'accept: application/x.access-token.v1+json' \
  -H 'Content-Type: application/x.credentials.v2+json' \
  -d '{
  "username": "user",
  "pass": "pass"
}'
# =>
# HTTP/1.1 400 Bad Request
# X-Powered-By: Express
# Content-Type: application/json; charset=utf-8
# Content-Length: 937
# ETag: W/"3a9-sLLSdpfxKxixbdOkZJyOsPlQ7Uw"
# Date: Wed, 21 May 2025 13:27:23 GMT
# Connection: keep-alive
# Keep-Alive: timeout=5
#
# {"message":"request/body must have required property 'user'","status":400,"errors":[{"path":"/body/user","message":"must have required property 'user'","errorCode":"required.openapi.validation"}],"stack":"Bad Request: request/body must have required property 'user'\n    at Object.POST-/authentications-application/x.credentials.v2+json (/Volumes/OpenReply/Tools/nestjs-express-openapi/node_modules/express-openapi-validator/dist/middlewares/openapi.request.validator.js:134:31)\n    at RequestValidator.validate (/Volumes/OpenReply/Tools/nestjs-express-openapi/node_modules/express-openapi-validator/dist/middlewares/openapi.request.validator.js:48:41)\n    at /Volumes/OpenReply/Tools/nestjs-express-openapi/node_modules/express-openapi-validator/dist/openapi.validator.js:233:53\n    at /Volumes/OpenReply/Tools/nestjs-express-openapi/node_modules/express-openapi-validator/dist/openapi.validator.js:165:28","path":"/authentications"}

OK_TOKEN=$(curl -s -X 'POST' \
  'http://localhost:3000/authentications?privileges=date%3aread&privileges=something%3aelse&privileges=test' \
  -H 'accept: application/x.access-token.v1+json' \
  -H 'Content-Type: application/x.credentials.v2+json' \
  -d '{
  "user": "user",
  "pass": "pass"
}' | jq -r '.access_token')
curl 'localhost:3000/dates/yesterday' -H "Authorization: Bearer $OK_TOKEN"
# => {"date":"2025-05-11"}

INSUFFICIENT_TOKEN=$(curl -s -X 'POST' \
  'http://localhost:3000/authentications?privileges=date%3aread&privileges=something%3aelse' \
  -H 'accept: application/x.access-token.v1+json' \
  -H 'Content-Type: application/x.credentials.v2+json' \
  -d '{
  "user": "user",
  "pass": "pass"
}' | jq -r '.access_token')
curl 'localhost:3000/dates/yesterday' -H "Authorization: Bearer $INSUFFICIENT_TOKEN"
# => {"message":"You have insufficient privileges to access this resource","status":403,"errors":[{"path":"/dates/{time}","message":"You have insufficient privileges to access this resource"}]}
```
