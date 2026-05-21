import { supabase } from "../db/supabase.js";
import type { Database } from "../db/types.js";

type ArtistInsert = Database["public"]["Tables"]["artists"]["Insert"];
type ArtistUpdate = Database["public"]["Tables"]["artists"]["Update"];

export const artistsService = {
  list: (orgId: string) => supabase.from("artists").select("*").eq("organization_id", orgId),
  create: (orgId: string, payload: Omit<ArtistInsert, "organization_id">) =>
    supabase.from("artists").insert({ ...payload, organization_id: orgId }).select("*").single(),
  byId: (orgId: string, id: string) => supabase.from("artists").select("*").eq("organization_id", orgId).eq("id", id).single(),
  update: (orgId: string, id: string, payload: ArtistUpdate) =>
    supabase.from("artists").update(payload).eq("organization_id", orgId).eq("id", id).select("*").single(),
  delete: (orgId: string, id: string) => supabase.from("artists").delete().eq("organization_id", orgId).eq("id", id),
};
