import { Injectable } from "@nestjs/common";
import * as jsonwebtoken from "jsonwebtoken";

@Injectable()
export class AppService {
  getHello(name: string) {
    return `Hello, ${name}!`;
  }

  createToken(privileges: string[]) {
    // You would not create a token just like this in a production system.
    // This just illustrates how custom security handling can be implemented.
    const nowUnixSeconds = Math.floor(Date.now() / 1000);
    return jsonwebtoken.sign(
      {
        iat: nowUnixSeconds,
        exp: nowUnixSeconds + 60 * 60 * 10,
        privileges,
      },
      "my-secret",
      { algorithm: "HS512" },
    );
  }
}
