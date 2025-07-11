import { Module } from "@nestjs/common";
import { OpenapiMiddlewareModule } from "@openreplyde/nestjs-express-openapi";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { requireAllPrivileges } from "./security-handler-privileges.js";

// Import the bundled API specification from the generated file
import { apiSpec } from "../generated/openapi.js";

@Module({
  imports: [
    OpenapiMiddlewareModule.register({
      apiSpec,
      jwtVerifier: {
        // DO NOT USE this config for production. Use more secure settings like "RS512" with a key pair
        secret: "my-secret",
        algorithms: ["HS512"],
      },
      openapiValidator: {
        validateSecurity: {
          handlers: {
            // the keys of this object must match the `securitySchemes` names in the openapi.yaml
            requireAllPrivileges,
          },
        },
      },
      serveOpenapiDocs: { path: "/api-docs" },
      serveSwaggerUi: { path: "/swagger-ui" },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
