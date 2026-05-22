import { supabase } from "../db/supabase.js";
import type { Database } from "../db/types.js";
import { enqueueProcessingJob } from "./redisQueue.service.js";

type ProcessingJobRow = Database["public"]["Tables"]["processing_jobs"]["Row"];

export const processingService = {
  async queue(orgId: string, trackId: string, input_r2_key: string) {
    const { data, error } = await supabase
      .from("processing_jobs")
      .insert({ organization_id: orgId, track_id: trackId, type: "audio_processing", status: "queued", input_r2_key, log: { retryCount: 0 } })
      .select("*")
      .single();

    if (data?.id) await enqueueProcessingJob(data.id);
    return { data: data as ProcessingJobRow | null, error };
  },

  async retry(orgId: string, id: string) {
    const { data: job } = await supabase.from("processing_jobs").select("*").eq("organization_id", orgId).eq("id", id).single();
    const row = job as ProcessingJobRow | null;
    if (!row) return { data: null, error: new Error("Job not found") };

    const retryCount = Number((row.log as any)?.retryCount ?? 0) + 1;
    const { data, error } = await supabase.from("processing_jobs").insert({
      organization_id: row.organization_id,
      track_id: row.track_id,
      type: row.type,
      status: "queued",
      input_r2_key: row.input_r2_key,
      log: { retryCount, retryOf: row.id },
    }).select("*").single();

    if (data?.id) await enqueueProcessingJob(data.id);
    return { data: data as ProcessingJobRow | null, error };
  },

  async list(orgId: string) {
    const { data, error } = await supabase.from("processing_jobs").select("*").eq("organization_id", orgId).order("created_at", { ascending: false });
    return { data: data as ProcessingJobRow[] | null, error };
  },

  async byId(orgId: string, id: string) {
    const { data, error } = await supabase.from("processing_jobs").select("*").eq("organization_id", orgId).eq("id", id).single();
    return { data: data as ProcessingJobRow | null, error };
  },

  async dashboard(orgId: string) {
    const { data } = await supabase.from("processing_jobs").select("status, created_at, updated_at, track_id, error_message").eq("organization_id", orgId).order("created_at", { ascending: false }).limit(100);
    const rows = data ?? [];
    const counts = rows.reduce<Record<string, number>>((acc, row: any) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1;
      return acc;
    }, {});
    return { counts, recent: rows };
  },
};
