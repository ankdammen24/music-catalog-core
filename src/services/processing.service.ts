import { supabase } from "../db/supabase.js";
import type { Database } from "../db/types.js";

type ProcessingJobRow = Database["public"]["Tables"]["processing_jobs"]["Row"];

export const processingService = {
  async queue(orgId: string, trackId: string, input_r2_key: string) {
    const { data, error } = await supabase
      .from("processing_jobs")
      .insert({ organization_id: orgId, track_id: trackId, type: "audio_processing", status: "queued", input_r2_key })
      .select("*")
      .single();
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
};
