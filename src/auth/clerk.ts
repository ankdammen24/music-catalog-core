import { createClerkClient, verifyToken } from "@clerk/backend";
import { env } from "../config/env";
export const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });
export async function verifyClerkJwt(token:string){
  return verifyToken(token, { jwtKey: undefined, issuer: env.CLERK_JWT_ISSUER, jwksUrl: env.CLERK_JWKS_URL });
}
