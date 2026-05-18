import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { supabase } from "../db/supabase";
import { r2 } from "./r2.service";
import { probeAudio, toFlac } from "./audio.service";
import { env } from "../config/env";
export async function processTrack(job:any){
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "mc-"));
  const input = path.join(tempDir, "input"); const output = path.join(tempDir, `${job.track_id}.flac`);
  await supabase.from("processing_jobs").update({ status: "running" }).eq("id", job.id);
  try {
    const obj = await r2.send(new GetObjectCommand({ Bucket: env.R2_BUCKET, Key: job.input_r2_key }));
    const bytes = Buffer.from(await obj.Body!.transformToByteArray()); await fs.writeFile(input, bytes);
    const info = await probeAudio(input);
    await toFlac(input, output);
    const flacKey = `masters/flac/${job.organization_id}/${job.track_id}/${job.track_id}.flac`;
    await r2.send(new PutObjectCommand({ Bucket: env.R2_BUCKET, Key: flacKey, Body: await fs.readFile(output), ContentType: "audio/flac" }));
    const stream = info.streams?.find((s:any)=>s.codec_type==="audio") || {};
    await supabase.from("tracks").update({ status: "processed", audio_flac_r2_key: flacKey, duration_seconds: Math.round(Number(info.format?.duration||0)), sample_rate: Number(stream.sample_rate||0), channels: Number(stream.channels||0) }).eq("id", job.track_id);
    await supabase.from("processing_jobs").update({ status: "completed", output_r2_key: flacKey, log: info }).eq("id", job.id);
  } catch (error:any) {
    await supabase.from("tracks").update({ status: "failed" }).eq("id", job.track_id);
    await supabase.from("processing_jobs").update({ status: "failed", error_message: String(error?.message||error) }).eq("id", job.id);
  }
}
