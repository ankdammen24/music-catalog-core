import cors from "cors";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import { requireAuth } from "./auth/requireAuth.js";
import { requireOrganizationContext } from "./auth/organization.middleware.js";
import { corsOrigins } from "./config/env.js";
import { artistsRoutes } from "./routes/artists.routes.js";
import { assetsRoutes } from "./routes/assets.routes.js";
import { healthRoutes } from "./routes/health.routes.js";
import { processingRoutes } from "./routes/processing.routes.js";
import { organizationsRoutes } from "./routes/organizations.routes.js";
import { releasesRoutes } from "./routes/releases.routes.js";
import { storagePublicRoutes, storageRoutes } from "./routes/storage.routes.js";
import { tracksRoutes } from "./routes/tracks.routes.js";
import { uploadsRoutes } from "./routes/uploads.routes.js";
import { errorHandler } from "./utils/errors.js";

const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) return true;

  return corsOrigins.some((allowed: string) => {
    if (allowed.includes("*")) {
      const pattern = new RegExp(`^${allowed.replace(/[.+?^${}()|[\\]\\]/g, "\\$&").replace(/\\\*/g, ".*")}$`);
      return pattern.test(origin);
    }

    return allowed === origin;
  });
};

export const app = express();

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-API-Service", "music-catalog-core");
  res.setHeader("X-API-Version", process.env.npm_package_version ?? "unknown");
  next();
});

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith("/health") || req.path === "/cors-test") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
  }
  next();
});

app.use(
  cors({
    origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    optionsSuccessStatus: 204,
  }),
);

app.options("*", cors());

app.use((req: Request, res: Response, next: NextFunction) => {
  res.on("finish", () => {
    const origin = req.get("origin") ?? "-";
    console.info(`${req.method} ${req.path} origin=${origin} statusCode=${res.statusCode}`);
  });
  next();
});

app.use(express.json());
app.use(healthRoutes);
app.use(storagePublicRoutes);
app.use(requireAuth);
app.use(requireOrganizationContext);
app.use(artistsRoutes);
app.use(assetsRoutes);
app.use(releasesRoutes);
app.use(tracksRoutes);
app.use(uploadsRoutes);
app.use(processingRoutes);
app.use(organizationsRoutes);
app.use(storageRoutes);
app.use(errorHandler);
