import type { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import { normalizeMediaType } from "./normalize-media-type.js";

type KeysMatching<T extends object, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

type Method = KeysMatching<
  OpenAPIV3.PathItemObject,
  OpenAPIV3.OperationObject | undefined
>;

function normalizeApiSpecContent<
  T extends { content?: { [media: string]: OpenAPIV3.MediaTypeObject } },
>(t: T | OpenAPIV3.ReferenceObject | undefined): void {
  if (!t || !Object.hasOwn(t, "content")) {
    return;
  }
  const { content } = t as T;
  if (!content) {
    return;
  }
  const normalizedContent: T["content"] = {};
  for (const media of Object.keys(content)) {
    const normalizedType = normalizeMediaType(media);
    normalizedContent[normalizedType] = content[media];
  }
  (t as T).content = normalizedContent;
}

export function normalizeApiSpec<
  Doc extends OpenAPIV3.DocumentV3 | OpenAPIV3.DocumentV3_1,
>(apiSpec: Doc): Doc {
  const clone = structuredClone(apiSpec);
  for (const path of Object.keys(clone.paths ?? {})) {
    const pathItemObject = clone.paths?.[path] ?? {};
    for (const method of Object.keys(pathItemObject)) {
      const operationObject = pathItemObject[method as Method];
      if (!operationObject) {
        continue;
      }
      normalizeApiSpecContent(operationObject.requestBody);

      if (!operationObject?.responses) {
        continue;
      }
      for (const statusCode of Object.keys(operationObject.responses)) {
        normalizeApiSpecContent(operationObject.responses[statusCode]);
      }
    }
  }
  if (clone.components?.requestBodies) {
    for (const requestBodyName of Object.keys(clone.components.requestBodies)) {
      const requestBodyObject = clone.components.requestBodies[requestBodyName];
      normalizeApiSpecContent(requestBodyObject);
    }
  }
  if (clone.components?.responses) {
    for (const responseBodyName of Object.keys(clone.components.responses)) {
      const responseObject = clone.components.responses[responseBodyName];
      normalizeApiSpecContent(responseObject);
    }
  }
  return clone;
}
