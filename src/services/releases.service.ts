import { supabase } from "../db/supabase.js";
import type { Database } from "../db/types.js";

type ReleaseRow = Database["public"]["Tables"]["releases"]["Row"];
type ReleaseInsert = Database["public"]["Tables"]["releases"]["Insert"];
type ReleaseUpdate = Database["public"]["Tables"]["releases"]["Update"];

export const releasesService = {
  async list(organizationId: string) {
    const { data, error } = await supabase.from("releases").select("*").eq("organization_id", organizationId);
    return { data: data as ReleaseRow[] | null, error };
  },
  async create(organizationId: string, payload: Omit<ReleaseInsert, "organization_id" | "status">) {
    const { data, error } = await supabase
      .from("releases")
      .insert({ ...payload, organization_id: organizationId, status: "draft" })
      .select("*")
      .single();
    return { data: data as ReleaseRow | null, error };
  },
  async byId(organizationId: string, id: string) {
    const { data, error } = await supabase.from("releases").select("*").eq("organization_id", organizationId).eq("id", id).single();
    return { data: data as ReleaseRow | null, error };
  },
  async update(organizationId: string, id: string, payload: ReleaseUpdate) {
    const { data, error } = await supabase.from("releases").update(payload).eq("organization_id", organizationId).eq("id", id).select("*").single();
    return { data: data as ReleaseRow | null, error };
  },
  delete: (organizationId: string, id: string) => supabase.from("releases").delete().eq("organization_id", organizationId).eq("id", id),
  async submit(organizationId: string, id: string) {
    const { data, error } = await supabase.from("releases").update({ status: "ready_for_review" }).eq("organization_id", organizationId).eq("id", id).select("*").single();
    return { data: data as ReleaseRow | null, error };
  },
  async approve(organizationId: string, id: string) {
    const { data, error } = await supabase.from("releases").update({ status: "approved" }).eq("organization_id", organizationId).eq("id", id).select("*").single();
    return { data: data as ReleaseRow | null, error };
  },
};
