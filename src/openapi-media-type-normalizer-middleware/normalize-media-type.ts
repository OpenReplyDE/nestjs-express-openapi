import { ContentType } from "express-openapi-validator/dist/middlewares/util.js";

export const normalizeMediaType = (media: string) =>
  ContentType.fromString(media).normalize([]);
