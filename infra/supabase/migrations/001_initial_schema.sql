create extension if not exists pgcrypto;
create type public.app_role as enum ('admin','label','artist','editor','listener','service');

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

create table public.artists (
 id uuid primary key default gen_random_uuid(), name text not null, display_name text, bio text, country text, website_url text, image_key text, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.users (
 id uuid primary key default gen_random_uuid(), clerk_user_id text unique not null, email text unique, role public.app_role not null default 'listener', artist_id uuid references public.artists(id), created_at timestamptz default now(), updated_at timestamptz default now());
create table public.albums (
 id uuid primary key default gen_random_uuid(), artist_id uuid not null references public.artists(id) on delete cascade, title text not null, release_date date, artwork_key text, upc text, status text default 'draft', created_at timestamptz default now(), updated_at timestamptz default now());
create table public.tracks (
 id uuid primary key default gen_random_uuid(), artist_id uuid not null references public.artists(id) on delete cascade, album_id uuid references public.albums(id) on delete set null, title text not null, version text, isrc text, duration integer, bpm integer, genre text, mood text, explicit boolean default false, language text, status text default 'draft', rights_status text default 'pending', master_file_key text, normalized_file_key text, preview_file_key text, artwork_key text, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.releases (
 id uuid primary key default gen_random_uuid(), title text not null, artist_id uuid not null references public.artists(id), album_id uuid references public.albums(id), release_type text, release_date date, upc text, status text default 'draft', distribution_status text default 'pending', created_at timestamptz default now(), updated_at timestamptz default now());
create table public.playlists (
 id uuid primary key default gen_random_uuid(), name text not null, description text, usage_type text, station_scope text, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.playlist_tracks (
 id uuid primary key default gen_random_uuid(), playlist_id uuid not null references public.playlists(id) on delete cascade, track_id uuid not null references public.tracks(id) on delete cascade, sort_order integer not null default 0);
create table public.rights (
 id uuid primary key default gen_random_uuid(), track_id uuid not null references public.tracks(id) on delete cascade, composer text, lyricist text, publisher text, label text, ownership_notes text, stim_registered boolean default false, sami_registered boolean default false, iswc text, isrc text, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.processing_jobs (
 id uuid primary key default gen_random_uuid(), track_id uuid not null references public.tracks(id) on delete cascade, job_type text not null, status text not null default 'queued', message text, created_at timestamptz default now(), completed_at timestamptz);

create trigger trg_users_updated before update on public.users for each row execute function public.set_updated_at();
create trigger trg_artists_updated before update on public.artists for each row execute function public.set_updated_at();
create trigger trg_albums_updated before update on public.albums for each row execute function public.set_updated_at();
create trigger trg_tracks_updated before update on public.tracks for each row execute function public.set_updated_at();
create trigger trg_releases_updated before update on public.releases for each row execute function public.set_updated_at();
create trigger trg_playlists_updated before update on public.playlists for each row execute function public.set_updated_at();
create trigger trg_rights_updated before update on public.rights for each row execute function public.set_updated_at();

create index idx_users_clerk_user_id on public.users(clerk_user_id);
create index idx_tracks_artist_id on public.tracks(artist_id);
create index idx_tracks_album_id on public.tracks(album_id);
create index idx_albums_artist_id on public.albums(artist_id);
create index idx_releases_artist_id on public.releases(artist_id);
create index idx_playlist_tracks_playlist_id on public.playlist_tracks(playlist_id);
create index idx_processing_jobs_status on public.processing_jobs(status);

alter table public.users enable row level security;
alter table public.artists enable row level security;
alter table public.albums enable row level security;
alter table public.tracks enable row level security;
alter table public.releases enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_tracks enable row level security;
alter table public.rights enable row level security;
alter table public.processing_jobs enable row level security;

create policy p_select_artists on public.artists for select using (true);
create policy p_select_albums on public.albums for select using (true);
create policy p_select_tracks on public.tracks for select using (true);
create policy p_select_releases on public.releases for select using (true);
create policy p_select_playlists on public.playlists for select using (true);
