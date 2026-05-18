import { Router } from "express"; import { processingService } from "../services/processing.service.js"; import { tracksService } from "../services/tracks.service.js";
export const processingRoutes=Router();
processingRoutes.post("/processing/tracks/:trackId/queue",async(r,s)=>{const t=(await tracksService.byId(r.auth!.organizationId,r.params.trackId)).data as any; const j=await processingService.queue(r.auth!.organizationId,r.params.trackId,t.audio_original_r2_key); await tracksService.update(r.auth!.organizationId,r.params.trackId,{status:"processing"}); s.status(201).json(j.data);});
processingRoutes.get("/processing/jobs",async(r,s)=>s.json((await processingService.list(r.auth!.organizationId)).data));
processingRoutes.get("/processing/jobs/:id",async(r,s)=>s.json((await processingService.byId(r.auth!.organizationId,r.params.id)).data));
