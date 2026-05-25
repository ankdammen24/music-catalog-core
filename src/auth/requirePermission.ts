import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      logger.warn({ path: req.path, method: req.method }, "auth failure: missing token");
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (req.user.roles.includes("platform_admin")) {
      next();
      return;
    }

    if (!req.user.permissions.includes(permission)) {
      logger.warn({ path: req.path, method: req.method, permission, userId: req.user.id }, "auth failure: missing permission");
      res.status(403).json({ error: "Forbidden", missingPermission: permission });
      return;
    }

    next();
  };
}
