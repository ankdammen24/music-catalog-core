import { supabase } from "../db/supabase.js";
export const artistsService = {
  list: (orgId: string) => supabase.from("artists").select("*").eq("organization_id", orgId),
  create: (orgId: string, payload: object) => supabase.from("artists").insert({ ...payload, organization_id: orgId }).select("*").single(),
  byId: (orgId: string, id: string) => supabase.from("artists").select("*").eq("organization_id", orgId).eq("id", id).single(),
  update: (orgId: string, id: string, payload: object) => supabase.from("artists").update(payload).eq("organization_id", orgId).eq("id", id).select("*").single(),
  delete: (orgId: string, id: string) => supabase.from("artists").delete().eq("organization_id", orgId).eq("id", id)
};
