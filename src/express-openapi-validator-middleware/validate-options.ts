import { OpenApiValidatorOpts } from "express-openapi-validator/dist/framework/types.js";
import { z } from "zod/v4";

const SerDes = z.object({
  format: z.string(),
  serialize: z.optional(z.instanceof(Function)),
  deserialize: z.optional(z.instanceof(Function)),
});

const ValidateResponseOpts = z.object({
  removeAdditional: z.optional(
    z.union([z.boolean(), z.literal("all"), z.literal("failing")]),
  ),
  coerceTypes: z.optional(z.union([z.boolean(), z.literal("array")])),
  onError: z.optional(z.instanceof(Function)),
});

const ValidateRequestOpts = z.object({
  allowUnknownQueryParameters: z.optional(z.boolean()),
  coerceTypes: z.optional(z.union([z.boolean(), z.literal("array")])),
  removeAdditional: z.optional(
    z.union([z.boolean(), z.literal("all"), z.literal("failing")]),
  ),
});

const SecurityHandlers = z.record(z.string(), z.instanceof(Function));

const ValidateSecurityOpts = z.object({
  handlers: z.optional(SecurityHandlers),
});

const Format = z.object({
  name: z.string(),
  type: z.optional(z.union([z.literal("number"), z.literal("string")])),
  validate: z.instanceof(Function),
});

const FormatValidator = z.instanceof(Function);

const FormatCompare = z.instanceof(Function);

const FormatDefinition = z.object({
  type: z.optional(z.union([z.literal("string"), z.literal("number")])),
  validate: z.union([FormatValidator, z.string(), z.instanceof(RegExp)]),
  async: z.optional(z.literal(false)),
  compare: z.optional(FormatCompare),
});

const AddedFormat = z.union([
  z.literal(true),
  z.instanceof(RegExp),
  FormatValidator,
  FormatDefinition,
]);

const AjvFormat = z.union([AddedFormat, z.string()]);

const FormatName = z.union([
  z.literal("date"),
  z.literal("time"),
  z.literal("date-time"),
  z.literal("duration"),
  z.literal("uri"),
  z.literal("uri-reference"),
  z.literal("uri-template"),
  z.literal("url"),
  z.literal("email"),
  z.literal("hostname"),
  z.literal("ipv4"),
  z.literal("ipv6"),
  z.literal("regex"),
  z.literal("uuid"),
  z.literal("json-pointer"),
  z.literal("json-pointer-uri-fragment"),
  z.literal("relative-json-pointer"),
  z.literal("byte"),
  z.literal("int32"),
  z.literal("int64"),
  z.literal("float"),
  z.literal("double"),
  z.literal("password"),
  z.literal("binary"),
]);

const FormatMode = z.literal("fast", "full");

const FormatOptions = z.object({
  mode: z.optional(FormatMode),
  formats: z.optional(z.array(FormatName)),
  keywords: z.optional(z.boolean()),
});

const FormatsPluginOptions = z.union([z.array(FormatName), FormatOptions]);

const StorageEngine = z.object({
  _handleFile: z.instanceof(Function),
  _removeFile: z.instanceof(Function),
});

const MulterOptions = z.object({
  storage: z.optional(StorageEngine),
  dest: z.optional(z.string()),
  limits: z.optional(
    z.object({
      fieldNameSize: z.optional(z.number()),
      fieldSize: z.optional(z.number()),
      fields: z.optional(z.number()),
      fileSize: z.optional(z.number()),
      files: z.optional(z.number()),
      parts: z.optional(z.number()),
      headerPairs: z.optional(z.number()),
    }),
  ),
  preservePath: z.boolean(),
  fileFilter: z.optional(z.instanceof(Function)),
});

const OperationHandlerOptions = z.object({
  basePath: z.string(),
  resolver: z.instanceof(Function),
});

export const ExpressOpenapiValidatorMiddlewareOptions = z.object({
  validateApiSpec: z.optional(z.boolean()),
  validateResponses: z.optional(z.union([z.boolean(), ValidateResponseOpts])),
  validateRequests: z.optional(z.union([z.boolean(), ValidateRequestOpts])),
  validateSecurity: z.optional(z.union([z.boolean(), ValidateSecurityOpts])),
  ignorePaths: z.optional(
    z.union([z.instanceof(RegExp), z.instanceof(Function)]),
  ),
  ignoreUndocumented: z.optional(z.boolean()),
  securityHandlers: z.optional(SecurityHandlers),
  coerceTypes: z.optional(z.union([z.boolean(), z.literal("array")])),
  useRequestUrl: z.optional(z.boolean()),
  serDes: z.optional(z.array(SerDes)),
  formats: z.optional(
    z.union([z.array(Format), z.record(z.string(), AjvFormat)]),
  ),
  ajvFormats: z.optional(FormatsPluginOptions),
  fileUploader: z.optional(z.union([z.boolean(), MulterOptions])),
  multerOpts: z.optional(MulterOptions),
  $refParser: z.optional(
    z.object({
      mode: z.union([z.literal("bundle"), z.literal("dereference")]),
    }),
  ),
  operationsHandlers: z.optional(
    z.union([z.literal(false), z.string(), OperationHandlerOptions]),
  ),
  validateFormats: z.optional(z.union([z.boolean(), FormatMode])),
});

export type ExpressOpenapiValidatorMiddlewareOptions = z.infer<
  typeof ExpressOpenapiValidatorMiddlewareOptions
> &
  OpenApiValidatorOpts;
