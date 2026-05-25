import net from "node:net";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { Router } from "express";
import { env } from "../config/env.js";
import { corsOrigins } from "../config/env.js";
import { supabase } from "../db/supabase.js";

export const healthRoutes = Router();

healthRoutes.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "music-catalog-core", uptimeSeconds: Math.round(process.uptime()) });
});

healthRoutes.get("/cors-test", (req, res) => {
  res.json({
    ok: true,
    origin: req.get("origin") ?? null,
    cors: "enabled",
    allowedOrigins: corsOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    requiredRequestHeaders: ["Content-Type", "Authorization"],
  });
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
  const bucket = env.R2_BUCKET;
  const endpoint = env.R2_ENDPOINT;
  const endpointConfigured = Boolean(endpoint);
  const bucketConfigured = Boolean(bucket);
  const started = Date.now();

  const client = new S3Client({
    region: "auto",
    endpoint: endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID ?? "",
      secretAccessKey: env.R2_SECRET_ACCESS_KEY ?? "",
    },
  });

  try {
    await client.send(new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 1 }));
    res.json({
      status: "ok",
      dependency: "storage",
      provider: "r2",
      bucket,
      endpointConfigured,
      bucketConfigured,
      latencyMs: Date.now() - started,
    });
  } catch (error) {
    const err = error as {
      name?: string;
      message?: string;
      code?: string;
      Code?: string;
      $metadata?: { httpStatusCode?: number };
    };
    const rawCode = err.code ?? err.Code ?? err.name ?? "UNKNOWN";
    const httpStatusCode = err.$metadata?.httpStatusCode ?? 503;
    const message =
      rawCode === "AccessDenied" ? "Storage permission issue" :
      rawCode === "NoSuchBucket" ? "Storage bucket missing or name is incorrect" :
      rawCode === "InvalidAccessKeyId" ? "Storage access key is invalid" :
      rawCode === "SignatureDoesNotMatch" ? "Storage secret or endpoint configuration is invalid" :
      err.message ?? "Storage check failed";

    console.error("[health/storage] check failed", {
      provider: "r2",
      bucket,
      endpoint: endpointConfigured ? "(configured)" : "(missing)",
      errorName: err.name,
      errorCode: err.code,
      errorCodeAlt: err.Code,
      httpStatusCode: err.$metadata?.httpStatusCode,
      message: err.message,
    });

    res.status(503).json({
      status: "error",
      dependency: "storage",
      provider: "r2",
      bucket,
      endpointConfigured,
      bucketConfigured,
      code: rawCode,
      message,
      httpStatusCode,
      latencyMs: Date.now() - started,
    });
  }
});

healthRoutes.get("/health/auth-config", (_req, res) => {
  const issuerConfigured = Boolean(env.CONNECT_ISSUER);
  const jwksConfigured = Boolean(env.CONNECT_JWKS_URL);
  res.json({
    status: issuerConfigured && jwksConfigured ? "ok" : "error",
    dependency: "auth",
    issuerConfigured,
    jwksConfigured,
  });
});

async function pingRedis(redisUrl: string): Promise<boolean> {
  const parsed = new URL(redisUrl);
  const port = Number(parsed.port || 6379);
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: parsed.hostname, port }, () => {
      socket.write("*1\r\n$4\r\nPING\r\n");
    });
    socket.setTimeout(3000);
    socket.on("data", (data) => { resolve(data.toString().startsWith("+PONG")); socket.end(); });
    socket.on("timeout", () => { resolve(false); socket.destroy(); });
    socket.on("error", () => { resolve(false); });
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
