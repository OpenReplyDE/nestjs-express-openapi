# Changelog

## 0.3.0

This release allows you to use `x-extensible-enum` in API specifications such that you can be compliant with [Zalando's RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/).

## 0.2.0

### New Features

#### add types for request/response features

You can now import your request/response feature types from the generated `openapi.ts`:
```ts
import type {
  PathParameters,
  QueryParameters,
  RequestBody,
  RequestHeaders,
  ResponseBody,
} from "../generated/openapi.js";
```

And use them without the first `paths` type parameter that was required previously. See these examples:

This type will give you the query parameters that are specified at `GET /greetings`:
```ts
type GetDatesQuery = QueryParameters<{ method: 'get'; path: '/greetings' }>;
/* => type GetDatesQuery = {
    name?: string;
} | undefined */
```

This type will give you the path parameters that are specified at `GET /dates/{time}`:
```ts
type GetDatesParams = PathParameters<{ method: 'get'; path: '/dates/{time}' }>;
/* => type GetDatesParams = {
    time: "today" | "yesterday";
} */
```

Note that the `RequestBody` requires an additional `contentType` property:
This type will give you the request body type that is specified at `POST /authentications` for the `application/x.credentials.v1+json` request-content-type:
```ts
type AuthenticationBody = RequestBody<{ method: 'post'; path: '/authentications'; contentType: 'application/x.credentials.v1+json' }>;
/* => type AuthenticationBody = {
    username: string;
    password: string;
} */
```

Please also note that `ResponseBody` requires a `status` property in the second type argument:
```ts
type TokenResponse = ResponseBody<{ method: 'post'; path: '/authentications'; status: 200 } >;
/* => type TokenResponse = {
    access_token: string;
    scheme: "bearer";
} */
```
