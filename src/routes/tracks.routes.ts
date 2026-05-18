import { Router } from "express";import { z } from "zod";import { crudRouter } from "./crudFactory";import { patchByOrg } from "../services/base";
const create = z.object({ release_id:z.string().uuid(), artist_id:z.string().uuid(), title:z.string().min(1), version:z.string().optional(), isrc:z.string().optional(), track_number:z.number().int().optional(), explicit:z.boolean().optional(), status:z.string().default('draft') });
const patch=create.partial();
export const tracksRouter = Router(); tracksRouter.use(crudRouter('tracks','tracks',create,patch));
tracksRouter.post('/tracks/:id/approve',async(req,res)=>{const a=(req as any).auth;const {data,error}=await patchByOrg('tracks',req.params.id,a.organizationId,{status:'approved'});if(error)return res.status(400).json({error:error.message});res.json(data);});
tracksRouter.post('/tracks/:id/reject',async(req,res)=>{const a=(req as any).auth;const {data,error}=await patchByOrg('tracks',req.params.id,a.organizationId,{status:'rejected'});if(error)return res.status(400).json({error:error.message});res.json(data);});
