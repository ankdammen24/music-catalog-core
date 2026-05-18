import { supabase } from "../db/supabase";import { processTrack } from "../services/processing.service";import { env } from "../config/env";
async function loop(){if(env.AUDIO_WORKER_ENABLED!=='true') return; const {data}=await supabase.from('processing_jobs').select('*').eq('status','queued').limit(5); for(const job of data||[]) await processTrack(job);} setInterval(loop,5000); loop();
