import { type RequestHandler } from "express";

import { normalizeMediaType } from "./normalize-media-type.js";

export function normalizeRequestHeaderTypes(
  req: Parameters<RequestHandler>[0],
): void {
  const { headers } = req;
  if (headers.accept) {
    const normalizedType = normalizeMediaType(headers.accept);
    headers.accept = normalizedType;
  }
  if (headers["content-type"]) {
    const normalizedType = normalizeMediaType(headers["content-type"]);
    headers["content-type"] = normalizedType;
  }
}
