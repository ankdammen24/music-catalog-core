import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { env, requireEnv } from "../config/env.js";
import type { Database } from "../db/types.js";
import { supabase } from "../db/supabase.js";
import { audioService } from "../services/audio.service.js";
import { buildFlacKey, r2Client } from "../services/r2.service.js";

async function streamToBuffer(stream: AsyncIterable<Uint8Array>): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function tick() {
  const { data: jobsData } = await supabase.from("processing_jobs").select("*").eq("status", "queued").limit(1);
  const jobs = jobsData as Database["public"]["Tables"]["processing_jobs"]["Row"][] | null;
  const job: Database["public"]["Tables"]["processing_jobs"]["Row"] | undefined = jobs?.[0];
  if (!job || !job.track_id) return;

  const temp = mkdtempSync(join(tmpdir(), "mc-"));

  try {
    await supabase.from("processing_jobs").update({ status: "running" }).eq("id", job.id);

    const res = await r2Client.send(
      new GetObjectCommand({ Bucket: requireEnv("R2_BUCKET"), Key: job.input_r2_key }),
    );
    if (!res.Body) throw new Error("Missing input file stream");

    const inFile = join(temp, "in");
    writeFileSync(inFile, await streamToBuffer(res.Body as AsyncIterable<Uint8Array>));

    const probe = await audioService.probe(inFile);
    const loud = await audioService.analyzeLoudness(inFile);

    const outFile = join(temp, `${job.track_id}.flac`);
    await audioService.toFlac(inFile, outFile);
    const outKey = buildFlacKey(job.organization_id, job.track_id);

    await r2Client.send(
      new PutObjectCommand({
        Bucket: requireEnv("R2_BUCKET"),
        Key: outKey,
        Body: readFileSync(outFile),
        ContentType: "audio/flac",
      }),
    );

    await supabase
      .from("tracks")
      .update({
        status: "processed",
        duration_seconds: Math.round(probe.duration),
        sample_rate: probe.sampleRate,
        channels: probe.channels,
        loudness_lufs: loud.lufs,
        true_peak_db: loud.truePeakDb,
        audio_flac_r2_key: outKey,
        audio_master_r2_key: outKey,
      })
      .eq("id", job.track_id);

    await supabase
      .from("processing_jobs")
      .update({ status: "completed", output_r2_key: outKey, log: { probe, loud } })
      .eq("id", job.id);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await supabase.from("processing_jobs").update({ status: "failed", error_message: message }).eq("id", job.id);
    await supabase.from("tracks").update({ status: "rejected" }).eq("id", job.track_id);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

if (env.AUDIO_WORKER_ENABLED) {
  setInterval(() => {
    void tick();
  }, 5000);
}
