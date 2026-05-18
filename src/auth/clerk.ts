import { verifyToken } from "@clerk/backend";

import { env } from "../config/env";

export async function verifyClerkJwt(token: string) {
  return verifyToken(token, {
    secretKey: env.CLERK_SECRET_KEY
  });
}
