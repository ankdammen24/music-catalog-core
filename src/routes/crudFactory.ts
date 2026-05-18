import { Router } from "express";
import { z } from "zod";
import { createByOrg, deleteByOrg, getByOrg, listByOrg, patchByOrg } from "../services/base";
export function crudRouter(path:string, table:string, createSchema:z.ZodTypeAny, patchSchema:z.ZodTypeAny){
 const r=Router();
 r.get(`/${path}`, async (req,res)=>{const a=(req as any).auth; const {data,error}=await listByOrg(table,a.organizationId); if(error) return res.status(400).json({error:error.message}); res.json(data);});
 r.post(`/${path}`, async (req,res)=>{const a=(req as any).auth; const payload=createSchema.parse(req.body); const {data,error}=await createByOrg(table,{...payload,organization_id:a.organizationId}); if(error) return res.status(400).json({error:error.message}); res.status(201).json(data);});
 r.get(`/${path}/:id`, async (req,res)=>{const a=(req as any).auth; const {data,error}=await getByOrg(table,req.params.id,a.organizationId); if(error) return res.status(404).json({error:error.message}); res.json(data);});
 r.patch(`/${path}/:id`, async (req,res)=>{const a=(req as any).auth; const payload=patchSchema.parse(req.body); const {data,error}=await patchByOrg(table,req.params.id,a.organizationId,payload); if(error) return res.status(400).json({error:error.message}); res.json(data);});
 r.delete(`/${path}/:id`, async (req,res)=>{const a=(req as any).auth; const {error}=await deleteByOrg(table,req.params.id,a.organizationId); if(error) return res.status(400).json({error:error.message}); res.status(204).send();});
 return r;
}
