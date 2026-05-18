import { supabase } from "../db/supabase";
export async function listByOrg(table:string, organizationId:string){ return supabase.from(table).select("*").eq("organization_id", organizationId); }
export async function getByOrg(table:string,id:string,organizationId:string){ return supabase.from(table).select("*").eq("id",id).eq("organization_id",organizationId).single(); }
export async function createByOrg(table:string,payload:any){ return supabase.from(table).insert(payload).select("*").single(); }
export async function patchByOrg(table:string,id:string,organizationId:string,payload:any){ return supabase.from(table).update(payload).eq("id",id).eq("organization_id",organizationId).select("*").single(); }
export async function deleteByOrg(table:string,id:string,organizationId:string){ return supabase.from(table).delete().eq("id",id).eq("organization_id",organizationId); }
