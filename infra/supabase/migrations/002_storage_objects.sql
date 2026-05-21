create table if not exists public.storage_objects (
  id uuid primary key,
  provider text not null,
  bucket text not null,
  object_key text unique not null,
  area text not null,
  entity_type text,
  entity_id text,
  filename text not null,
  content_type text,
  size_bytes bigint,
  etag text,
  public_url text,
  visibility text not null default 'private',
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
