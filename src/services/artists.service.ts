import { supabase } from "../db/supabase.js";
import type { Database } from "../db/types.js";

type ArtistRow = Database["public"]["Tables"]["artists"]["Row"];
type ArtistInsert = Database["public"]["Tables"]["artists"]["Insert"];
type ArtistUpdate = Database["public"]["Tables"]["artists"]["Update"];

export const artistsService = {
  async list(orgId: string) {
    const query = supabase.from("artists").select("*").eq("organization_id", orgId);
    const { data, error } = await query;
    return { data: data as ArtistRow[] | null, error };
  },
  async create(orgId: string, payload: Omit<ArtistInsert, "organization_id">) {
    const query = supabase.from("artists").insert({ ...payload, organization_id: orgId }).select("*").single();
    const { data, error } = await query;
    return { data: data as ArtistRow | null, error };
  },
  async byId(orgId: string, id: string) {
    const query = supabase.from("artists").select("*").eq("organization_id", orgId).eq("id", id).single();
    const { data, error } = await query;
    return { data: data as ArtistRow | null, error };
  },
  async update(orgId: string, id: string, payload: ArtistUpdate) {
    const query = supabase.from("artists").update(payload).eq("organization_id", orgId).eq("id", id).select("*").single();
    const { data, error } = await query;
    return { data: data as ArtistRow | null, error };
  },
  delete: (orgId: string, id: string) => supabase.from("artists").delete().eq("organization_id", orgId).eq("id", id),
};
