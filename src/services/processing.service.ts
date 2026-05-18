import { supabase } from "../db/supabase.js";
export const processingService = {
  queue: (orgId:string, trackId:string, input_r2_key:string)=>supabase.from("processing_jobs").insert({organization_id:orgId,track_id:trackId,job_type:"audio_processing",status:"queued",input_r2_key}).select("*").single(),
  list: (orgId:string)=>supabase.from("processing_jobs").select("*").eq("organization_id",orgId).order("created_at",{ascending:false}),
  byId: (orgId:string,id:string)=>supabase.from("processing_jobs").select("*").eq("organization_id",orgId).eq("id",id).single()
};
