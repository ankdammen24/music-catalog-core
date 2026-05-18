import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { env } from "../config/env";
import { supabase } from "../db/supabase";
import { probeAudio, toFlac } from "./audio.service";
import { r2 } from "./r2.service";

export async function processTrack(job: { id: string; organization_id: string; track_id: string; input_r2_key: string }) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "mc-"));
  const input = path.join(tempDir, "input-audio");
  const output = path.join(tempDir, `${job.track_id}.flac`);

  await supabase.from("processing_jobs").update({ status: "running" }).eq("id", job.id);

  try {
    const object = await r2.send(new GetObjectCommand({ Bucket: env.R2_BUCKET, Key: job.input_r2_key }));
    const bytes = Buffer.from(await object.Body!.transformToByteArray());
    await fs.writeFile(input, bytes);

    const info = await probeAudio(input);
    await toFlac(input, output);

    const flacKey = `masters/flac/${job.organization_id}/${job.track_id}/${job.track_id}.flac`;
    await r2.send(
      new PutObjectCommand({
        Bucket: env.R2_BUCKET,
        Key: flacKey,
        Body: await fs.readFile(output),
        ContentType: "audio/flac"
      })
    );

    const audioStream = info.streams?.find((stream: any) => stream.codec_type === "audio");

    await supabase
      .from("tracks")
      .update({
        status: "processed",
        audio_flac_r2_key: flacKey,
        duration_seconds: Math.round(Number(info.format?.duration ?? 0)),
        sample_rate: Number(audioStream?.sample_rate ?? 0),
        channels: Number(audioStream?.channels ?? 0)
      })
      .eq("id", job.track_id);

    await supabase
      .from("processing_jobs")
      .update({ status: "completed", output_r2_key: flacKey, log: info })
      .eq("id", job.id);
  } catch (error) {
    await supabase.from("tracks").update({ status: "rejected" }).eq("id", job.track_id);
    await supabase
      .from("processing_jobs")
      .update({ status: "failed", error_message: String((error as Error).message ?? error) })
      .eq("id", job.id);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}
