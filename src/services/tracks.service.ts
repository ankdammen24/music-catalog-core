import { supabase } from "../db/supabase.js";
import type { Database } from "../db/types.js";

type TrackInsert = Database["public"]["Tables"]["tracks"]["Insert"];
type TrackUpdate = Database["public"]["Tables"]["tracks"]["Update"];

export const tracksService = {
  list: (organizationId: string) => supabase.from("tracks").select("*").eq("organization_id", organizationId),
  create: (organizationId: string, payload: Omit<TrackInsert, "organization_id" | "status">) =>
    supabase.from("tracks").insert({ ...payload, organization_id: organizationId, status: "draft" }).select("*").single(),
  byId: (organizationId: string, id: string) => supabase.from("tracks").select("*").eq("organization_id", organizationId).eq("id", id).single(),
  update: (organizationId: string, id: string, payload: TrackUpdate) =>
    supabase.from("tracks").update(payload).eq("organization_id", organizationId).eq("id", id).select("*").single(),
  delete: (organizationId: string, id: string) => supabase.from("tracks").delete().eq("organization_id", organizationId).eq("id", id),
  approve: (organizationId: string, id: string) =>
    supabase.from("tracks").update({ status: "approved" }).eq("organization_id", organizationId).eq("id", id).select("*").single(),
  reject: (organizationId: string, id: string) =>
    supabase.from("tracks").update({ status: "rejected" }).eq("organization_id", organizationId).eq("id", id).select("*").single(),
};
