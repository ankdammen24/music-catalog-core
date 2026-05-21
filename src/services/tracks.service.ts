import { supabase } from "../db/supabase.js";
import type { Database } from "../db/types.js";

type TrackRow = Database["public"]["Tables"]["tracks"]["Row"];
type TrackInsert = Database["public"]["Tables"]["tracks"]["Insert"];
type TrackUpdate = Database["public"]["Tables"]["tracks"]["Update"];

export const tracksService = {
  async list(organizationId: string) {
    const { data, error } = await supabase.from("tracks").select("*").eq("organization_id", organizationId);
    return { data: data as TrackRow[] | null, error };
  },
  async create(organizationId: string, payload: Omit<TrackInsert, "organization_id" | "status">) {
    const { data, error } = await supabase.from("tracks").insert({ ...payload, organization_id: organizationId, status: "draft" }).select("*").single();
    return { data: data as TrackRow | null, error };
  },
  async byId(organizationId: string, id: string) {
    const { data, error } = await supabase.from("tracks").select("*").eq("organization_id", organizationId).eq("id", id).single();
    return { data: data as TrackRow | null, error };
  },
  async update(organizationId: string, id: string, payload: TrackUpdate) {
    const { data, error } = await supabase.from("tracks").update(payload).eq("organization_id", organizationId).eq("id", id).select("*").single();
    return { data: data as TrackRow | null, error };
  },
  delete: (organizationId: string, id: string) => supabase.from("tracks").delete().eq("organization_id", organizationId).eq("id", id),
  async approve(organizationId: string, id: string) {
    const { data, error } = await supabase.from("tracks").update({ status: "approved" }).eq("organization_id", organizationId).eq("id", id).select("*").single();
    return { data: data as TrackRow | null, error };
  },
  async reject(organizationId: string, id: string) {
    const { data, error } = await supabase.from("tracks").update({ status: "rejected" }).eq("organization_id", organizationId).eq("id", id).select("*").single();
    return { data: data as TrackRow | null, error };
  },
};
