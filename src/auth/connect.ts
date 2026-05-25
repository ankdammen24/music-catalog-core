import type { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import type { ConnectUser } from "./types.js";

const connectJwks = createRemoteJWKSet(new URL(env.CONNECT_JWKS_URL));

type ConnectClaims = {
  sub?: string;
  email?: string;
  name?: string;
  roles?: unknown;
  permissions?: unknown;
  [key: string]: unknown;
};

const normalizeStringArray = (input: unknown): string[] =>
  Array.isArray(input) ? input.filter((item): item is string => typeof item === "string") : [];

const extractBearerToken = (header: string | undefined): string | null => {
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
};

export async function authenticateConnectToken(req: Request, _res: Response, next: NextFunction) {
  try {
    if (!env.CONNECT_REQUIRED) {
      return next();
    }

    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
      logger.warn({ path: req.path, method: req.method }, "auth failure: missing token");
      return next();
    }

    const { payload } = await jwtVerify(token, connectJwks, {
      issuer: env.CONNECT_ISSUER,
      audience: env.CONNECT_AUDIENCE,
    });

    const claims = payload as ConnectClaims;
    if (!claims.sub || typeof claims.sub !== "string") {
      logger.warn({ path: req.path, method: req.method }, "auth failure: invalid token subject");
      return next();
    }

    const roles = normalizeStringArray(claims.roles);
    const permissions = normalizeStringArray(claims.permissions);

    const user: ConnectUser = {
      id: claims.sub,
      email: typeof claims.email === "string" ? claims.email : undefined,
      name: typeof claims.name === "string" ? claims.name : undefined,
      roles,
      permissions,
      rawClaims: claims,
    };

    req.user = user;
    const organizationId = typeof claims.org_id === "string" ? claims.org_id : undefined;
    req.auth = { userId: user.id, organizationId };
    return next();
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    const lowered = message.toLowerCase();
    if (lowered.includes("issuer")) {
      logger.warn({ path: req.path, method: req.method, message }, "auth failure: invalid issuer");
    } else if (lowered.includes("audience")) {
      logger.warn({ path: req.path, method: req.method, message }, "auth failure: invalid audience");
    } else {
      logger.warn({ path: req.path, method: req.method, message }, "auth failure: invalid token");
    }
    return next();
  }
}
