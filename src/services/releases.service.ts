import { supabase } from "../db/supabase.js";
import type { Database } from "../db/types.js";

type ReleaseInsert = Database["public"]["Tables"]["releases"]["Insert"];
type ReleaseUpdate = Database["public"]["Tables"]["releases"]["Update"];

export const releasesService = {
  list: (organizationId: string) => supabase.from("releases").select("*").eq("organization_id", organizationId),
  create: (organizationId: string, payload: Omit<ReleaseInsert, "organization_id" | "status">) =>
    supabase.from("releases").insert({ ...payload, organization_id: organizationId, status: "draft" }).select("*").single(),
  byId: (organizationId: string, id: string) => supabase.from("releases").select("*").eq("organization_id", organizationId).eq("id", id).single(),
  update: (organizationId: string, id: string, payload: ReleaseUpdate) =>
    supabase.from("releases").update(payload).eq("organization_id", organizationId).eq("id", id).select("*").single(),
  delete: (organizationId: string, id: string) => supabase.from("releases").delete().eq("organization_id", organizationId).eq("id", id),
  submit: (organizationId: string, id: string) =>
    supabase.from("releases").update({ status: "ready_for_review" }).eq("organization_id", organizationId).eq("id", id).select("*").single(),
  approve: (organizationId: string, id: string) =>
    supabase.from("releases").update({ status: "approved" }).eq("organization_id", organizationId).eq("id", id).select("*").single(),
};
