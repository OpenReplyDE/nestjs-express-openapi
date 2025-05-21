import type { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";

import { normalizeApiSpec } from "./index.js";

describe("openapi-media-type-normalizer normalize-api-spec", () => {
  let apiSpec: OpenAPIV3.DocumentV3;
  let normalizedApiSpec: OpenAPIV3.DocumentV3;

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
    normalizedApiSpec = normalizeApiSpec(apiSpec);
  });

  it("normalizes the media types of accept-types without refs", async () => {
    const specObject =
      normalizedApiSpec.paths["/foo/without-ref"].get?.responses?.[200];
    // @ts-ignore
    const content = specObject?.content;

    expect(Object.keys(content)).toEqual([
      "application/vnd.first+json",
      "application/vnd.foo.fetch+json; version=1",
      "application/vnd.foo.fetch+json; version=2",
      "application/vnd.foo.fetch.v3+json",
    ]);
  });

  it("normalizes the media types of accept-types in the writing endpoint in the paths objects", async () => {
    const specObject =
      normalizedApiSpec.paths["/foo/without-ref"].post?.responses?.[200];
    // @ts-ignore
    const content = specObject?.content;

    expect(Object.keys(content)).toEqual([
      "application/vnd.first+json",
      "application/vnd.foo.fetch+json; version=1",
      "application/vnd.foo.fetch+json; version=2",
      "application/vnd.foo.fetch.v3+json",
    ]);
  });

  it("normalizes the media types of content-types in the writing endpoint in the paths objects", async () => {
    const specObject =
      normalizedApiSpec.paths["/foo/without-ref"].post?.requestBody;
    // @ts-ignore
    const content = specObject?.content;

    expect(Object.keys(content)).toEqual([
      "application/vnd.first+json",
      "application/vnd.foo.create+json; version=1",
      "application/vnd.foo.create+json; version=2",
      "application/vnd.foo.create.v3+json",
    ]);
  });

  it("normalizes the media types of accept-types in the paths objects", async () => {
    const specObject =
      normalizedApiSpec.paths["/foo/without-ref"].get?.responses?.[200];
    // @ts-ignore
    const content = specObject?.content;

    expect(Object.keys(content)).toEqual([
      "application/vnd.first+json",
      "application/vnd.foo.fetch+json; version=1",
      "application/vnd.foo.fetch+json; version=2",
      "application/vnd.foo.fetch.v3+json",
    ]);
  });

  it("normalizes the media types of accept-types in the component.responses", async () => {
    const specObject = normalizedApiSpec.components?.responses?.any;
    // @ts-ignore
    const content = specObject?.content;

    expect(Object.keys(content)).toEqual([
      "application/vnd.first+json",
      "application/vnd.foo.fetch+json; version=1",
      "application/vnd.foo.fetch+json; version=2",
      "application/vnd.foo.fetch.v3+json",
    ]);
  });

  it("normalizes the media types of content-types in the component.requestBodies", async () => {
    const specObject = normalizedApiSpec.components?.requestBodies?.post;
    // @ts-ignore
    const content = specObject?.content;

    expect(Object.keys(content)).toEqual([
      "application/vnd.first+json",
      "application/vnd.foo.create+json; version=1",
      "application/vnd.foo.create+json; version=2",
      "application/vnd.foo.create.v3+json",
    ]);
  });
});
