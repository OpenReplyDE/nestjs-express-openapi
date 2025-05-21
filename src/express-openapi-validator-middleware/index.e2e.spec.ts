import express, { RequestHandler } from "express";
import type { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import request from "supertest";

import { createExpressOpenapiValidatorMiddleware } from "./index.js";

describe("express-openapi-validator-middleware e2e", () => {
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
        createExpressOpenapiValidatorMiddleware({
          apiSpec,
        }),
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

        describe("in the Accept header", () => {
          // biome-ignore lint/complexity/noExcessiveNestedTestSuites: This is needed for readable structuring
          describe("when the OpenAPI-specified response body type does not have a space before the parameters", () => {
            describe("when the request Accept header does not have a space before the parameters", () => {
              let accept: string;
              beforeEach(() => {
                accept = "application/vnd.foo.fetch+json;version=1";
              });

              it("the validator chooses the correct type of the spec for the request", async () => {
                const response = await request(app)
                  .get(endpoint)
                  .set("Accept", accept);
                expect(response.statusCode).toEqual(200);
              });

              it("the request has the correct, original accept header", async () => {
                const response = await request(app)
                  .get(endpoint)
                  .set("Accept", accept);
                expect(response.body.accept).toEqual(accept);
              });
            });

            describe("when the request Accept header has a space before the parameters", () => {
              let accept: string;
              beforeEach(() => {
                accept = "application/vnd.foo.fetch+json; version=1";
              });

              it("the validator chooses the correct type of the spec for the request", async () => {
                const response = await request(app)
                  .get(endpoint)
                  .set("Accept", accept);
                expect(response.statusCode).toEqual(200);
              });

              it("the request has the correct, original accept header", async () => {
                const response = await request(app)
                  .get(endpoint)
                  .set("Accept", accept);
                expect(response.body.accept).toEqual(accept);
              });
            });
          });

          // biome-ignore lint/complexity/noExcessiveNestedTestSuites: This is needed for readable structuring
          describe("when the OpenAPI-specified response body type has a space before the parameters", () => {
            describe("when the request Accept header does not have a space before the parameters", () => {
              let accept: string;
              beforeEach(() => {
                accept = "application/vnd.foo.fetch+json;version=2";
              });

              it("does not match the types", async () => {
                const response = await request(app)
                  .get(endpoint)
                  .set("Accept", accept);
                expect(response.statusCode).toEqual(500);
                expect(response.text).toMatch(
                  /\/response\/accept must be equal to one of the allowed values: application\/vnd.foo.fetch\+json; version=2/,
                );
              });
            });

            describe("when the request Accept header has a space before the parameters", () => {
              let accept: string;
              beforeEach(() => {
                accept = "application/vnd.foo.fetch+json; version=2";
              });

              it("the validator chooses the correct type of the spec for the request", async () => {
                const response = await request(app)
                  .get(endpoint)
                  .set("Accept", accept);
                expect(response.statusCode).toEqual(200);
              });

              it("the request has the correct, original accept header", async () => {
                const response = await request(app)
                  .get(endpoint)
                  .set("Accept", accept);
                expect(response.body.accept).toEqual(accept);
              });
            });
          });

          // biome-ignore lint/complexity/noExcessiveNestedTestSuites: This is needed for readable structuring
          describe("when the OpenAPI-specified response body type does not have parameters", () => {
            let accept: string;
            beforeEach(() => {
              accept = "application/vnd.foo.fetch.v3+json";
            });

            it("the validator chooses the correct type of the spec for the request", async () => {
              const response = await request(app)
                .get(endpoint)
                .set("Accept", accept);
              expect(response.statusCode).toEqual(200);
            });

            it("the request has the correct, original accept header", async () => {
              const response = await request(app)
                .get(endpoint)
                .set("Accept", accept);
              expect(response.body.accept).toEqual(accept);
            });
          });

          // biome-ignore lint/complexity/noExcessiveNestedTestSuites: This is needed for readable structuring
          describe("when the requested content type is not OpenAPI-specified", () => {
            let accept: string;
            beforeEach(() => {
              accept = "application/json";
            });

            it("the validator picks the first content type from the list (see https://github.com/cdimascio/express-openapi-validator/blob/v5.1.6/src/middlewares/openapi.response.validator.ts#L145)", async () => {
              const response = await request(app)
                .get(endpoint)
                .set("Accept", accept);
              expect(response.statusCode).toEqual(500);
              expect(response.text).toMatch(
                /\/response\/accept must be equal to one of the allowed values: application\/vnd\.first\+json/,
              );
            });
          });
        });

        describe("in the Content-Type header", () => {
          // biome-ignore lint/complexity/noExcessiveNestedTestSuites: This is needed for readable structuring
          describe("when the OpenAPI-specified request and response body types do not have a space before the parameters", () => {
            describe("when the request Accept and Content-Type header do not have a space before the parameters", () => {
              let accept: string;
              let contentType: string;
              beforeEach(() => {
                accept = "application/vnd.foo.fetch+json;version=1";
                contentType = "application/vnd.foo.create+json;version=1";
              });

              it("the validator chooses the correct types of the spec for the request", async () => {
                const response = await request(app)
                  .post(endpoint)
                  .send({
                    accept: accept.replace(";", "; "), // the normalized string is hard coded in the api spec
                    contentType: contentType.replace(";", "; "), // the normalized string is hard coded in the api spec
                  })
                  .set("Accept", accept)
                  .set("Content-Type", contentType);
                expect(response.statusCode).toEqual(200);
              });

              it("the request object has the correct, original accept and content-types headers", async () => {
                const response = await request(app)
                  .post(endpoint)
                  .send({
                    accept: accept.replace(";", "; "), // the normalized string is hard coded in the api spec
                    contentType: contentType.replace(";", "; "), // the normalized string is hard coded in the api spec
                  })
                  .set("Accept", accept)
                  .set("Content-Type", contentType);
                expect(response.body.accept).toEqual(accept);
                expect(response.body.contentType).toEqual(contentType);
              });
            });

            describe("when the request Accept and Content-Type headers have a space before the parameters", () => {
              let accept: string;
              let contentType: string;
              beforeEach(() => {
                accept = "application/vnd.foo.fetch+json; version=1";
                contentType = "application/vnd.foo.create+json; version=1";
              });

              it("the validator chooses the correct types of the spec for the request", async () => {
                const response = await request(app)
                  .post(endpoint)
                  .send({
                    accept,
                    contentType,
                  })
                  .set("Accept", accept)
                  .set("Content-Type", contentType);
                expect(response.statusCode).toEqual(200);
              });

              it("the request object has the correct, original accept and content-types headers", async () => {
                const response = await request(app)
                  .post(endpoint)
                  .send({
                    accept,
                    contentType,
                  })
                  .set("Accept", accept)
                  .set("Content-Type", contentType);
                expect(response.body.accept).toEqual(accept);
                expect(response.body.contentType).toEqual(contentType);
              });
            });
          });

          // biome-ignore lint/complexity/noExcessiveNestedTestSuites: This is needed for readable structuring
          describe("when the OpenAPI-specified request and response body types have a space before the parameters", () => {
            describe("when the request Accept and Content-Type header do not have a space before the parameters", () => {
              let accept: string;
              let contentType: string;
              beforeEach(() => {
                accept = "application/vnd.foo.fetch+json;version=2";
                contentType = "application/vnd.foo.create+json;version=2";
              });

              it("the validator fails because there is no match between the types", async () => {
                const response = await request(app)
                  .post(endpoint)
                  .send({
                    accept: accept.replace(";", "; "), // the normalized string is hard coded in the api spec
                    contentType: contentType.replace(";", "; "), // the normalized string is hard coded in the api spec
                  })
                  .set("Accept", accept)
                  .set("Content-Type", contentType);
                expect(response.statusCode).toEqual(500);
                expect(response.text).toMatch(
                  /\/response\/accept must be equal to one of the allowed values: application\/vnd.foo.fetch\+json; version=2/,
                );
              });
            });

            describe("when the request Accept and Content-Type headers have a space before the parameters", () => {
              let accept: string;
              let contentType: string;
              beforeEach(() => {
                accept = "application/vnd.foo.fetch+json; version=2";
                contentType = "application/vnd.foo.create+json; version=2";
              });

              it("the validator chooses the correct types of the spec for the request", async () => {
                const response = await request(app)
                  .post(endpoint)
                  .send({
                    accept,
                    contentType,
                  })
                  .set("Accept", accept)
                  .set("Content-Type", contentType);
                expect(response.statusCode).toEqual(200);
              });

              it("the request object has the correct, original accept and content-types headers", async () => {
                const response = await request(app)
                  .post(endpoint)
                  .send({
                    accept,
                    contentType,
                  })
                  .set("Accept", accept)
                  .set("Content-Type", contentType);
                expect(response.body.accept).toEqual(accept);
                expect(response.body.contentType).toEqual(contentType);
              });
            });
          });

          // biome-ignore lint/complexity/noExcessiveNestedTestSuites: This is needed for readable structuring
          describe("when the OpenAPI-specified request and response body types do not have parameters", () => {
            let accept: string;
            let contentType: string;
            beforeEach(() => {
              accept = "application/vnd.foo.fetch.v3+json";
              contentType = "application/vnd.foo.create.v3+json";
            });

            it("the validator chooses the correct types of the spec for the request", async () => {
              const response = await request(app)
                .post(endpoint)
                .send({
                  accept,
                  contentType,
                })
                .set("Accept", accept)
                .set("Content-Type", contentType);
              expect(response.statusCode).toEqual(200);
            });

            it("the request object has the correct, original accept and content-types headers", async () => {
              const response = await request(app)
                .post(endpoint)
                .send({
                  accept,
                  contentType,
                })
                .set("Accept", accept)
                .set("Content-Type", contentType);
              expect(response.body.accept).toEqual(accept);
              expect(response.body.contentType).toEqual(contentType);
            });
          });

          // biome-ignore lint/complexity/noExcessiveNestedTestSuites: This is needed for readable structuring
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
            });
          });

          // biome-ignore lint/complexity/noExcessiveNestedTestSuites: This is needed for readable structuring
          describe("when the accept header is not OpenAPI-specified", () => {
            let accept: string;
            let contentType: string;
            beforeEach(() => {
              accept = "application/json";
              contentType = "application/vnd.foo.create.v3+json";
            });

            it("the validator picks the first content type from the list (see https://github.com/cdimascio/express-openapi-validator/blob/v5.1.6/src/middlewares/openapi.response.validator.ts#L145)", async () => {
              const response = await request(app)
                .post(endpoint)
                .send({
                  accept: "application/vnd.foo.fetch.v3+json",
                  contentType: "application/vnd.foo.create.v3+json",
                })
                .set("Accept", accept)
                .set("Content-Type", contentType);
              expect(response.statusCode).toEqual(500);
              expect(response.text).toMatch(
                /\/response\/accept must be equal to one of the allowed values: application\/vnd\.first\+json/,
              );
            });
          });
        });
      });
    });
  });
});
