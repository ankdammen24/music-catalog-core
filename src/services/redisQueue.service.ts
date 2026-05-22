import net from "node:net";
import { env } from "../config/env.js";

function encodeBulk(value: string): string {
  return `$${Buffer.byteLength(value)}\r\n${value}\r\n`;
}

function sendRedisCommand(command: string[]): Promise<string> {
  const redisUrl = new URL(env.REDIS_URL);
  const port = Number(redisUrl.port || 6379);

  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: redisUrl.hostname, port }, () => {
      const payload = `*${command.length}\r\n${command.map(encodeBulk).join("")}`;
      socket.write(payload);
    });

    socket.setTimeout(5000);
    socket.on("data", (data) => {
      resolve(data.toString());
      socket.end();
    });
    socket.on("error", reject);
    socket.on("timeout", () => {
      socket.destroy();
      reject(new Error("Redis command timeout"));
    });
  });
}

const QUEUE_NAME = "processing:audio";

export async function enqueueProcessingJob(jobId: string): Promise<void> {
  await sendRedisCommand(["LPUSH", QUEUE_NAME, jobId]);
}

export async function dequeueProcessingJob(): Promise<string | null> {
  const result = await sendRedisCommand(["RPOP", QUEUE_NAME]);
  if (result.startsWith("$-1")) return null;
  const lines = result.split("\r\n");
  return lines.length > 1 ? (lines[1] ?? null) : null;
}
