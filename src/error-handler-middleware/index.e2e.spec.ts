import express, { RequestHandler } from "express";
import type { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import request from "supertest";

import { createExpressOpenapiValidatorMiddleware } from "../express-openapi-validator-middleware/index.js";
import { createErrorHandlerMiddleware } from "./index.js";

describe("error-handler-middleware e2e", () => {
  const getController: RequestHandler = (req, res) => {
    // responding with the headers is part of the expectations below
    res.status(200).json({
      accept: req.headers.accept ?? "no accept header set",
    });
  };

  const postController: RequestHandler = (req, res) => {
    // responding with the headers is part of the expectations below
    res.status(200).json({
      accept: req.headers.accept ?? "no accept header set",
      contentType: req.headers["content-type"] ?? "no content-type header set",
    });
  };

  let apiSpec: OpenAPIV3.DocumentV3;
  beforeEach(() => {
    // There is the same api spec twice:
    // Once with $ref to components/{requestBodies,responses} at `/foo/with-ref`
    // and once without $refs at `/foo/without-ref`.
    // This is needed because normalizing must be tested on both of them.
    apiSpec = {
      openapi: "3.0.2",
      info: {
        title: "test",
        version: "1.0.0",
      },
      paths: {
        "/foo/without-ref": {
          get: {
            responses: {
              200: {
                description: "",
                content: {
                  "application/vnd.first+json": {
                    schema: {
                      type: "object",
                      required: ["accept"],
                      properties: {
                        accept: {
                          type: "string",
                          enum: ["application/vnd.first+json"],
                        },
                      },
                    },
                  },
                  // without space:
                  "application/vnd.foo.fetch+json;version=1": {
                    schema: {
                      type: "object",
                      required: ["accept"],
                      properties: {
                        accept: {
                          type: "string",
                          enum: ["application/vnd.foo.fetch+json; version=1"], // note the space here because of normalization
                        },
                      },
                    },
                  },
                  // with space:
                  "application/vnd.foo.fetch+json; version=2": {
                    schema: {
                      type: "object",
                      required: ["accept"],
                      properties: {
                        accept: {
                          type: "string",
                          enum: ["application/vnd.foo.fetch+json; version=2"],
                        },
                      },
                    },
                  },
                  // without parameters:
                  "application/vnd.foo.fetch.v3+json": {
                    schema: {
                      type: "object",
                      required: ["accept"],
                      properties: {
                        accept: {
                          type: "string",
                          enum: ["application/vnd.foo.fetch.v3+json"],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          post: {
            requestBody: {
              required: true,
              content: {
                "application/vnd.first+json": {
                  schema: {
                    type: "object",
                    required: ["accept", "contentType"],
                    properties: {
                      accept: {
                        type: "string",
                        enum: ["application/vnd.first+json"],
                      },
                      contentType: {
                        type: "string",
                        enum: ["application/vnd.first+json"],
                      },
                    },
                  },
                },
                // without space:
                "application/vnd.foo.create+json;version=1": {
                  schema: {
                    type: "object",
                    required: ["accept", "contentType"],
                    properties: {
                      accept: {
                        type: "string",
                        enum: ["application/vnd.foo.fetch+json; version=1"],
                      },
                      contentType: {
                        type: "string",
                        enum: ["application/vnd.foo.create+json; version=1"],
                      },
                    },
                  },
                },
                // with space:
                "application/vnd.foo.create+json; version=2": {
                  schema: {
                    type: "object",
                    required: ["accept", "contentType"],
                    properties: {
                      accept: {
                        type: "string",
                        enum: ["application/vnd.foo.fetch+json; version=2"],
                      },
                      contentType: {
                        type: "string",
                        enum: ["application/vnd.foo.create+json; version=2"],
                      },
                    },
                  },
                },
                // without parameters:
                "application/vnd.foo.create.v3+json": {
                  schema: {
                    type: "object",
                    required: ["accept", "contentType"],
                    properties: {
                      accept: {
                        type: "string",
                        enum: ["application/vnd.foo.fetch.v3+json"],
                      },
                      contentType: {
                        type: "string",
                        enum: ["application/vnd.foo.create.v3+json"],
                      },
                    },
                  },
                },
              },
            },
            responses: {
              200: {
                description: "",
                content: {
                  "application/vnd.first+json": {
                    schema: {
                      type: "object",
                      required: ["accept"],
                      properties: {
                        accept: {
                          type: "string",
                          enum: ["application/vnd.first+json"],
                        },
                      },
                    },
                  },
                  // without space:
                  "application/vnd.foo.fetch+json;version=1": {
                    schema: {
                      type: "object",
                      required: ["accept"],
                      properties: {
                        accept: {
                          type: "string",
                          enum: ["application/vnd.foo.fetch+json; version=1"], // note the space here because of normalization
                        },
                      },
                    },
                  },
                  // with space:
                  "application/vnd.foo.fetch+json; version=2": {
                    schema: {
                      type: "object",
                      required: ["accept"],
                      properties: {
                        accept: {
                          type: "string",
                          enum: ["application/vnd.foo.fetch+json; version=2"],
                        },
                      },
                    },
                  },
                  // without parameters:
                  "application/vnd.foo.fetch.v3+json": {
                    schema: {
                      type: "object",
                      required: ["accept"],
                      properties: {
                        accept: {
                          type: "string",
                          enum: ["application/vnd.foo.fetch.v3+json"],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        "/foo/with-ref": {
          get: {
            responses: {
              200: {
                $ref: "#/components/responses/any",
              },
            },
          },
          post: {
            requestBody: {
              $ref: "#/components/requestBodies/post",
              required: true,
            },
            responses: {
              200: {
                $ref: "#/components/responses/any",
              },
            },
          },
        },
      },
      components: {
        responses: {
          any: {
            description: "",
            content: {
              "application/vnd.first+json": {
                schema: {
                  type: "object",
                  required: ["accept"],
                  properties: {
                    accept: {
                      type: "string",
                      enum: ["application/vnd.first+json"],
                    },
                  },
                },
              },
              // without space:
              "application/vnd.foo.fetch+json;version=1": {
                schema: {
                  type: "object",
                  required: ["accept"],
                  properties: {
                    accept: {
                      type: "string",
                      enum: ["application/vnd.foo.fetch+json; version=1"], // note the space here because of normalization
                    },
                  },
                },
              },
              // with space:
              "application/vnd.foo.fetch+json; version=2": {
                schema: {
                  type: "object",
                  required: ["accept"],
                  properties: {
                    accept: {
                      type: "string",
                      enum: ["application/vnd.foo.fetch+json; version=2"],
                    },
                  },
                },
              },
              // without parameters:
              "application/vnd.foo.fetch.v3+json": {
                schema: {
                  type: "object",
                  required: ["accept"],
                  properties: {
                    accept: {
                      type: "string",
                      enum: ["application/vnd.foo.fetch.v3+json"],
                    },
                  },
                },
              },
            },
          },
        },
        requestBodies: {
          post: {
            required: true,
            content: {
              "application/vnd.first+json": {
                schema: {
                  type: "object",
                  required: ["accept", "contentType"],
                  properties: {
                    accept: {
                      type: "string",
                      enum: ["application/vnd.first+json"],
                    },
                    contentType: {
                      type: "string",
                      enum: ["application/vnd.first+json"],
                    },
                  },
                },
              },
              // without space:
              "application/vnd.foo.create+json;version=1": {
                schema: {
                  type: "object",
                  required: ["accept", "contentType"],
                  properties: {
                    accept: {
                      type: "string",
                      enum: ["application/vnd.foo.fetch+json; version=1"],
                    },
                    contentType: {
                      type: "string",
                      enum: ["application/vnd.foo.create+json; version=1"],
                    },
                  },
                },
              },
              // with space:
              "application/vnd.foo.create+json; version=2": {
                schema: {
                  type: "object",
                  required: ["accept", "contentType"],
                  properties: {
                    accept: {
                      type: "string",
                      enum: ["application/vnd.foo.fetch+json; version=2"],
                    },
                    contentType: {
                      type: "string",
                      enum: ["application/vnd.foo.create+json; version=2"],
                    },
                  },
                },
              },
              // without parameters:
              "application/vnd.foo.create.v3+json": {
                schema: {
                  type: "object",
                  required: ["accept", "contentType"],
                  properties: {
                    accept: {
                      type: "string",
                      enum: ["application/vnd.foo.fetch.v3+json"],
                    },
                    contentType: {
                      type: "string",
                      enum: ["application/vnd.foo.create.v3+json"],
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
  });

  describe("with defaults", () => {
    let app: express.Application;

    beforeEach(async () => {
      app = express();
      app.use(
        express.json({ type: ["json", "*/*+json"] }),
        createExpressOpenapiValidatorMiddleware({ apiSpec }),
        createErrorHandlerMiddleware(false),
      );
    });

    describe("media types according to https://datatracker.ietf.org/doc/html/rfc6838#section-4.3", () => {
      describe("when not using $ref for the types", () => {
        let endpoint: string;
        beforeEach(() => {
          endpoint = "/foo/without-ref";
          app.get(endpoint, getController);
          app.post(endpoint, postController);
        });

        describe("in the Content-Type header", () => {
          describe("when the content-type header is not OpenAPI-specified", () => {
            let accept: string;
            let contentType: string;
            beforeEach(() => {
              accept = "application/json";
              contentType = "application/json";
            });

            it("does not accept the request", async () => {
              const response = await request(app)
                .post(endpoint)
                .send({
                  accept,
                  contentType,
                })
                .set("Accept", accept)
                .set("Content-Type", contentType);
              expect(response.statusCode).toEqual(415);
              expect(response.body).toEqual({
                message: `unsupported media type ${contentType}`,
                status: 415,
                errors: [
                  {
                    path: endpoint,
                    message: `unsupported media type ${contentType}`,
                  },
                ],
              });
            });
          });
        });
      });

      describe("when using $ref for the types", () => {
        let endpoint: string;
        beforeEach(() => {
          endpoint = "/foo/with-ref";
          app.get(endpoint, getController);
          app.post(endpoint, postController);
        });

        describe("in the Content-Type header", () => {
          describe("when the content-type header is not OpenAPI-specified", () => {
            let accept: string;
            let contentType: string;
            beforeEach(() => {
              accept = "application/json";
              contentType = "application/json";
            });

            it("does not accept the request", async () => {
              const response = await request(app)
                .post(endpoint)
                .send({
                  accept,
                  contentType,
                })
                .set("Accept", accept)
                .set("Content-Type", contentType);
              expect(response.statusCode).toEqual(415);
              expect(response.body).toEqual({
                message: `unsupported media type ${contentType}`,
                status: 415,
                errors: [
                  {
                    path: endpoint,
                    message: `unsupported media type ${contentType}`,
                  },
                ],
              });
            });
          });
        });
      });
    });
  });

  describe("with verbose mode", () => {
    let app: express.Application;

    beforeEach(async () => {
      app = express();
      app.use(
        express.json({ type: ["json", "*/*+json"] }),
        createExpressOpenapiValidatorMiddleware({ apiSpec }),
        createErrorHandlerMiddleware("verbose"),
      );
    });

    describe("media types according to https://datatracker.ietf.org/doc/html/rfc6838#section-4.3", () => {
      describe("when not using $ref for the types", () => {
        let endpoint: string;
        beforeEach(() => {
          endpoint = "/foo/without-ref";
          app.get(endpoint, getController);
          app.post(endpoint, postController);
        });

        describe("in the Content-Type header", () => {
          describe("when the content-type header is not OpenAPI-specified", () => {
            let accept: string;
            let contentType: string;
            beforeEach(() => {
              accept = "application/json";
              contentType = "application/json";
            });

            it("does not accept the request", async () => {
              const response = await request(app)
                .post(endpoint)
                .send({
                  accept,
                  contentType,
                })
                .set("Accept", accept)
                .set("Content-Type", contentType);
              expect(response.statusCode).toEqual(415);
              expect(response.body).toMatchObject({
                message: `unsupported media type ${contentType}`,
                status: 415,
                errors: [
                  {
                    path: endpoint,
                    message: `unsupported media type ${contentType}`,
                  },
                ],
                stack: /Unsupported Media Type:/,
              });
            });
          });
        });
      });

      describe("when using $ref for the types", () => {
        let endpoint: string;
        beforeEach(() => {
          endpoint = "/foo/with-ref";
          app.get(endpoint, getController);
          app.post(endpoint, postController);
        });

        describe("in the Content-Type header", () => {
          describe("when the content-type header is not OpenAPI-specified", () => {
            let accept: string;
            let contentType: string;
            beforeEach(() => {
              accept = "application/json";
              contentType = "application/json";
            });

            it("does not accept the request", async () => {
              const response = await request(app)
                .post(endpoint)
                .send({
                  accept,
                  contentType,
                })
                .set("Accept", accept)
                .set("Content-Type", contentType);
              expect(response.statusCode).toEqual(415);
              expect(response.body).toMatchObject({
                message: `unsupported media type ${contentType}`,
                status: 415,
                errors: [
                  {
                    path: endpoint,
                    message: `unsupported media type ${contentType}`,
                  },
                ],
                stack: /Unsupported Media Type:/,
              });
            });
          });
        });
      });
    });
  });
});
