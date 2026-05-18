import { Router } from "express";import { z } from "zod";import { crudRouter } from "./crudFactory";import { patchByOrg } from "../services/base";
const create = z.object({ artist_id:z.string().uuid(), title:z.string().min(1), release_type:z.string().optional(), upc:z.string().optional(), artwork_r2_key:z.string().optional(), release_date:z.string().optional(), status:z.string().default("draft") });
const patch=create.partial();
export const releasesRouter = Router(); releasesRouter.use(crudRouter("releases","releases",create,patch));
releasesRouter.post('/releases/:id/submit',async(req,res)=>{const a=(req as any).auth;const {data,error}=await patchByOrg('releases',req.params.id,a.organizationId,{status:'ready_for_review'}); if(error) return res.status(400).json({error:error.message});res.json(data);});
releasesRouter.post('/releases/:id/approve',async(req,res)=>{const a=(req as any).auth;const {data,error}=await patchByOrg('releases',req.params.id,a.organizationId,{status:'approved'}); if(error) return res.status(400).json({error:error.message});res.json(data);});
