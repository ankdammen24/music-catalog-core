import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Database } from "../db/types.js";
import { supabase } from "../db/supabase.js";
import { audioService } from "../services/audio.service.js";
import { dequeueProcessingJob } from "../services/redisQueue.service.js";
import { getStorageProvider } from "../storage/storageProvider.js";

async function logJob(jobId: string, entry: Record<string, unknown>) {
  const { data } = await supabase.from("processing_jobs").select("log").eq("id", jobId).single();
  const existing = (data?.log as Record<string, unknown>) ?? {};
  await supabase.from("processing_jobs").update({ log: { ...existing, ...entry, updatedAt: new Date().toISOString() } }).eq("id", jobId);
}

async function setTrackState(trackId: string, state: "uploaded" | "validating" | "processing" | "ready" | "failed") {
  await supabase.from("tracks").update({ status: state as any }).eq("id", trackId);
}

async function tick() {
  const jobId = await dequeueProcessingJob();
  if (!jobId) return;

  const { data: job } = await supabase.from("processing_jobs").select("*").eq("id", jobId).single();
  const item = job as Database["public"]["Tables"]["processing_jobs"]["Row"] | null;
  if (!item?.track_id) return;

  const storage = getStorageProvider();
  const temp = mkdtempSync(join(tmpdir(), "mc-"));

  try {
    await supabase.from("processing_jobs").update({ status: "running" }).eq("id", item.id);
    await setTrackState(item.track_id, "validating");
    await logJob(item.id, { step: "download" });

    const object = await storage.getObject({ key: item.input_r2_key });
    if (!object.body) throw new Error("Missing input file stream");

    const inFile = join(temp, "input.bin");
    writeFileSync(inFile, Buffer.from(object.body));

    const probe = await audioService.probe(inFile);
    if (!probe.sampleRate || !probe.channels) throw new Error("Invalid audio file");

    await setTrackState(item.track_id, "processing");
    await logJob(item.id, { step: "normalize", probe });

    const normalizedFile = join(temp, "normalized.wav");
    await audioService.normalize(inFile, normalizedFile);

    const loud = await audioService.analyzeLoudness(normalizedFile);
    const flacFile = join(temp, `${item.track_id}.flac`);
    await audioService.toFlac(normalizedFile, flacFile);

    const waveformFile = join(temp, `${item.track_id}-waveform.png`);
    await audioService.waveformPng(normalizedFile, waveformFile);

    const previewFile = join(temp, `${item.track_id}-preview.mp3`);
    await audioService.previewMp3(normalizedFile, previewFile);

    const baseKey = `normalized/${item.organization_id}/${item.track_id}`;
    const flacKey = `${baseKey}/master.flac`;
    const waveformKey = `previews/waveforms/${item.organization_id}/${item.track_id}.png`;
    const previewKey = `previews/audio/${item.organization_id}/${item.track_id}.mp3`;

    await storage.uploadObject({ key: flacKey, body: readFileSync(flacFile), contentType: "audio/flac" });
    await storage.uploadObject({ key: waveformKey, body: readFileSync(waveformFile), contentType: "image/png" });
    await storage.uploadObject({ key: previewKey, body: readFileSync(previewFile), contentType: "audio/mpeg" });

    await supabase.from("tracks").update({
      status: "ready" as any,
      duration_seconds: Math.round(probe.duration),
      sample_rate: probe.sampleRate,
      channels: probe.channels,
      loudness_lufs: loud.lufs,
      true_peak_db: loud.truePeakDb,
      audio_flac_r2_key: flacKey,
      audio_master_r2_key: flacKey,
      metadata: { waveform_r2_key: waveformKey, preview_r2_key: previewKey, format: probe.format, codec: probe.codec } as any,
    }).eq("id", item.track_id);

    await supabase.from("assets").insert([
      { organization_id: item.organization_id, status: "processed", filename: `${item.track_id}.flac`, mime_type: "audio/flac", r2_key: flacKey },
      { organization_id: item.organization_id, status: "processed", filename: `${item.track_id}.png`, mime_type: "image/png", r2_key: waveformKey },
      { organization_id: item.organization_id, status: "processed", filename: `${item.track_id}.mp3`, mime_type: "audio/mpeg", r2_key: previewKey },
    ]);

    await supabase.from("processing_jobs").update({ status: "completed", output_r2_key: flacKey }).eq("id", item.id);
    await logJob(item.id, { step: "completed", loud });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await supabase.from("processing_jobs").update({ status: "failed", error_message: message }).eq("id", item.id);
    await setTrackState(item.track_id, "failed");
    await logJob(item.id, { step: "failed", error: message });
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

setInterval(() => { void tick(); }, 3000);
