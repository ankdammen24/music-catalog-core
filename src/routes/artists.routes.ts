import { Router } from "express"; import { z } from "zod"; import { artistsService } from "../services/artists.service.js";
const schema=z.object({name:z.string().min(1),slug:z.string().min(1),biography:z.string().optional(),country:z.string().optional()});
export const artistsRoutes=Router();
artistsRoutes.get("/artists",async(req,res)=>res.json((await artistsService.list(req.auth!.organizationId)).data));
artistsRoutes.post("/artists",async(req,res)=>res.status(201).json((await artistsService.create(req.auth!.organizationId,schema.parse(req.body))).data));
artistsRoutes.get("/artists/:id",async(req,res)=>res.json((await artistsService.byId(req.auth!.organizationId,req.params.id)).data));
artistsRoutes.patch("/artists/:id",async(req,res)=>res.json((await artistsService.update(req.auth!.organizationId,req.params.id,schema.partial().parse(req.body))).data));
artistsRoutes.delete("/artists/:id",async(req,res)=>{await artistsService.delete(req.auth!.organizationId,req.params.id);res.status(204).send();});
