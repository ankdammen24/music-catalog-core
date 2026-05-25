# Architecture
Supabase Postgres stores metadata. R2 stores media files. Microsoft Entra External ID authenticates users via connect.mediarosenqvist.com. API orchestrates auth, metadata, and signed URLs. Audio worker handles async processing jobs.
