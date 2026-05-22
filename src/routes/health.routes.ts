import net from "node:net";
import { Router } from "express";
import { env } from "../config/env.js";
import { supabase } from "../db/supabase.js";
import { getStorageDiagnostics } from "../services/storage/storage.service.js";

export const healthRoutes = Router();

healthRoutes.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "music-catalog-core", uptimeSeconds: Math.round(process.uptime()) });
});

healthRoutes.get("/cors-test", (req, res) => {
  res.json({ ok: true, origin: req.get("origin") ?? null, cors: "enabled" });
});

healthRoutes.get("/health/database", async (_req, res) => {
  const started = Date.now();
  const { error } = await supabase.from("artists").select("id").limit(1);

  if (error) {
    res.status(503).json({ status: "error", dependency: "database", message: "Database check failed" });
    return;
  }

  res.json({ status: "ok", dependency: "database", latencyMs: Date.now() - started });
});

healthRoutes.get("/health/storage", async (_req, res) => {
  try {
    const diagnostics = await getStorageDiagnostics();
    if (!diagnostics.bucketExists) {
      res.status(503).json({ status: "error", dependency: "storage", message: "Storage bucket not accessible", diagnostics });
      return;
    }

    res.json({ status: "ok", dependency: "storage", ...diagnostics });
  } catch (error) {
    res.status(503).json({ status: "error", dependency: "storage", message: "Storage check failed", error: (error as Error).message });
  }
});

healthRoutes.get("/health/auth-config", (_req, res) => {
  const issuerConfigured = Boolean(env.CLERK_JWT_ISSUER);
  const jwksConfigured = Boolean(env.CLERK_JWKS_URL);
  res.json({ status: issuerConfigured && jwksConfigured ? "ok" : "error", dependency: "auth", issuerConfigured, jwksConfigured });
});

async function pingRedis(redisUrl: string): Promise<boolean> {
  const parsed = new URL(redisUrl);
  const port = Number(parsed.port || 6379);

  return new Promise((resolve) => {
    const socket = net.createConnection({ host: parsed.hostname, port }, () => {
      socket.write("*1\r\n$4\r\nPING\r\n");
    });

    socket.setTimeout(3000);
    socket.on("data", (data) => {
      resolve(data.toString().startsWith("+PONG"));
      socket.end();
    });
    socket.on("timeout", () => {
      resolve(false);
      socket.destroy();
    });
    socket.on("error", () => {
      resolve(false);
    });
  });
}

healthRoutes.get("/health/redis", async (_req, res) => {
  const started = Date.now();
  const ok = await pingRedis(env.REDIS_URL);

  if (!ok) {
    res.status(503).json({ status: "error", dependency: "redis", message: "Redis check failed" });
    return;
  }

  res.json({ status: "ok", dependency: "redis", latencyMs: Date.now() - started });
});
