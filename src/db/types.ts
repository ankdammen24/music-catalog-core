export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type TrackStatus = "draft" | "uploaded" | "processing" | "processed" | "approved" | "rejected";
export type ReleaseStatus = "draft" | "ready_for_review" | "approved" | "rejected";
export type ProcessingJobStatus = "queued" | "processing" | "running" | "completed" | "failed";

export type Database = {
  public: {
    Tables: {
      artists: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          slug: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["artists"]["Row"]> & Pick<Database["public"]["Tables"]["artists"]["Row"], "organization_id" | "name">;
        Update: Partial<Database["public"]["Tables"]["artists"]["Row"]>;
        Relationships: [];
      };
      releases: {
        Row: {
          id: string;
          organization_id: string;
          artist_id: string | null;
          title: string;
          status: ReleaseStatus;
          release_date: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["releases"]["Row"]> & Pick<Database["public"]["Tables"]["releases"]["Row"], "organization_id" | "title">;
        Update: Partial<Database["public"]["Tables"]["releases"]["Row"]>;
        Relationships: [];
      };
      tracks: {
        Row: {
          id: string;
          organization_id: string;
          release_id: string | null;
          title: string;
          status: TrackStatus;
          duration_seconds: number | null;
          sample_rate: number | null;
          channels: number | null;
          loudness_lufs: number | null;
          true_peak_db: number | null;
          audio_original_r2_key: string | null;
          audio_flac_r2_key: string | null;
          audio_master_r2_key: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tracks"]["Row"]> & Pick<Database["public"]["Tables"]["tracks"]["Row"], "organization_id" | "title">;
        Update: Partial<Database["public"]["Tables"]["tracks"]["Row"]>;
        Relationships: [];
      };
      assets: {
        Row: {
          id: string;
          organization_id: string;
          status: "pending" | "uploaded" | "processed" | "failed";
          filename: string;
          mime_type: string | null;
          size_bytes: number | null;
          r2_key: string;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["assets"]["Row"]> & Pick<Database["public"]["Tables"]["assets"]["Row"], "organization_id" | "status" | "filename" | "r2_key">;
        Update: Partial<Database["public"]["Tables"]["assets"]["Row"]>;
        Relationships: [];
      };
      processing_jobs: {
        Row: {
          id: string;
          organization_id: string;
          track_id: string | null;
          type: "audio_processing" | "waveform_generation" | "metadata_extract";
          status: ProcessingJobStatus;
          input_r2_key: string;
          output_r2_key: string | null;
          log: Json | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["processing_jobs"]["Row"]> & Pick<Database["public"]["Tables"]["processing_jobs"]["Row"], "organization_id" | "type" | "input_r2_key">;
        Update: Partial<Database["public"]["Tables"]["processing_jobs"]["Row"]>;
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          clerk_org_id: string;
          name: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["organizations"]["Row"]> & Pick<Database["public"]["Tables"]["organizations"]["Row"], "clerk_org_id" | "name">;
        Update: Partial<Database["public"]["Tables"]["organizations"]["Row"]>;
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          clerk_user_id: string;
          organization_id: string | null;
          role: "owner" | "admin" | "member";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["users"]["Row"]> & Pick<Database["public"]["Tables"]["users"]["Row"], "clerk_user_id">;
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
        Relationships: [];
      };
    };
  };
};
