export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ReleaseStatus = "draft" | "ready_for_review" | "approved" | "rejected";
export type TrackStatus = "draft" | "approved" | "rejected";
export type AssetType = "audio" | "artwork" | "document" | "other";
export type ProcessingJobType = "audio_processing" | "waveform_generation" | "metadata_extract";
export type ProcessingJobStatus = "queued" | "processing" | "completed" | "failed";

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          clerk_org_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_org_id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_org_id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          clerk_user_id: string;
          organization_id: string | null;
          clerk_org_id: string | null;
          email: string | null;
          name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_user_id: string;
          organization_id?: string | null;
          clerk_org_id?: string | null;
          email?: string | null;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_user_id?: string;
          organization_id?: string | null;
          clerk_org_id?: string | null;
          email?: string | null;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
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
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          slug?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          slug?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
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
        Insert: {
          id?: string;
          organization_id: string;
          artist_id?: string | null;
          title: string;
          status?: ReleaseStatus;
          release_date?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          artist_id?: string | null;
          title?: string;
          status?: ReleaseStatus;
          release_date?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tracks: {
        Row: {
          id: string;
          organization_id: string;
          release_id: string | null;
          title: string;
          status: TrackStatus;
          isrc: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          release_id?: string | null;
          title: string;
          status?: TrackStatus;
          isrc?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          release_id?: string | null;
          title?: string;
          status?: TrackStatus;
          isrc?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      assets: {
        Row: {
          id: string;
          organization_id: string;
          track_id: string | null;
          release_id: string | null;
          type: AssetType;
          object_key: string;
          mime_type: string | null;
          size_bytes: number | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          track_id?: string | null;
          release_id?: string | null;
          type: AssetType;
          object_key: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          track_id?: string | null;
          release_id?: string | null;
          type?: AssetType;
          object_key?: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      processing_jobs: {
        Row: {
          id: string;
          organization_id: string;
          track_id: string | null;
          job_type: ProcessingJobType;
          status: ProcessingJobStatus;
          input_r2_key: string;
          output_r2_key: string | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          track_id?: string | null;
          job_type: ProcessingJobType;
          status?: ProcessingJobStatus;
          input_r2_key: string;
          output_r2_key?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          track_id?: string | null;
          job_type?: ProcessingJobType;
          status?: ProcessingJobStatus;
          input_r2_key?: string;
          output_r2_key?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
