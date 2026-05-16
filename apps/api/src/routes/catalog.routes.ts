import { GetObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { env } from '../config/env.js';
import { r2 } from '../lib/r2.js';
import { supabase } from '../lib/supabase.js';

const ok = <T>(data: T) => ({ ok: true as const, data });
const err = (code: string, message: string) => ({ ok: false as const, error: { code, message } });

function artworkUrlFromKey(key?: string | null) {
  if (!key) return null;
  return `${env.PUBLIC_API_BASE_URL}/api/v1/assets/artwork/${encodeURIComponent(key)}`;
}

export async function catalogRoutes(app: FastifyInstance) {
  app.get('/health', async (_req, reply) => {
    let database = 'ok';
    let storage = 'ok';

    const dbCheck = await supabase.from('artists').select('id').limit(1);
    if (dbCheck.error) database = 'error';

    try {
      await r2.send(new HeadBucketCommand({ Bucket: env.R2_BUCKET_NAME }));
    } catch {
      storage = 'error';
    }

    return reply.send(ok({ api: 'ok', database, storage, version: '0.1.0', environment: env.NODE_ENV }));
  });

  app.get('/releases', async (_req, reply) => {
    const { data, error } = await supabase.from('releases').select('id,title,artist_id,release_date,release_type,album_id,artists(name),albums(artwork_key)');
    if (error) return reply.code(500).send(err('RELEASES_FETCH_FAILED', 'Could not fetch releases'));
    const releases = (data ?? []).map((r: any) => ({
      id: r.id,
      title: r.title,
      artistId: r.artist_id,
      artistName: r.artists?.name ?? null,
      artworkUrl: artworkUrlFromKey(r.albums?.artwork_key),
      releaseDate: r.release_date,
      type: r.release_type,
      trackCount: 0
    }));
    return reply.send(ok(releases));
  });

  app.get('/artists', async (_req, reply) => {
    const { data, error } = await supabase.from('artists').select('id,name,bio,image_key');
    if (error) return reply.code(500).send(err('ARTISTS_FETCH_FAILED', 'Could not fetch artists'));
    return reply.send(ok((data ?? []).map((a) => ({ id: a.id, name: a.name, slug: a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), imageUrl: artworkUrlFromKey(a.image_key), bio: a.bio, verified: false }))));
  });

  app.get('/tracks', async (_req, reply) => {
    const { data, error } = await supabase.from('tracks').select('id,title,artist_id,album_id,duration,artwork_key,status,rights_status,artists(name),albums(title)');
    if (error) return reply.code(500).send(err('TRACKS_FETCH_FAILED', 'Could not fetch tracks'));
    return reply.send(ok((data ?? []).map((t: any) => ({
      id: t.id, title: t.title, artistId: t.artist_id, artistName: t.artists?.name ?? null,
      releaseId: t.album_id, releaseTitle: t.albums?.title ?? null, duration: t.duration,
      artworkUrl: artworkUrlFromKey(t.artwork_key), isPlayable: t.status === 'published' && t.rights_status === 'cleared',
      loudnessStatus: 'unknown', rightsStatus: t.rights_status ?? 'pending'
    }))));
  });

  app.get('/search', async (req, reply) => {
    const { q } = z.object({ q: z.string().min(1) }).parse(req.query);
    const [artistsRes, releasesRes, tracksRes] = await Promise.all([
      supabase.from('artists').select('id,name,bio,image_key').ilike('name', `%${q}%`).limit(20),
      supabase.from('releases').select('id,title,artist_id,artists(name),release_date,release_type').ilike('title', `%${q}%`).limit(20),
      supabase.from('tracks').select('id,title,artist_id,artists(name),album_id,albums(title),duration,rights_status,status').ilike('title', `%${q}%`).limit(20)
    ]);
    if (artistsRes.error || releasesRes.error || tracksRes.error) return reply.code(500).send(err('SEARCH_FAILED', 'Could not search catalog'));
    return reply.send(ok({
      artists: (artistsRes.data ?? []).map((a: any) => ({ id: a.id, name: a.name, slug: a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), imageUrl: artworkUrlFromKey(a.image_key), bio: a.bio, verified: false })),
      releases: (releasesRes.data ?? []).map((r: any) => ({ id: r.id, title: r.title, artistId: r.artist_id, artistName: r.artists?.name ?? null, artworkUrl: null, releaseDate: r.release_date, type: r.release_type, trackCount: 0 })),
      tracks: (tracksRes.data ?? []).map((t: any) => ({ id: t.id, title: t.title, artistId: t.artist_id, artistName: t.artists?.name ?? null, releaseId: t.album_id, releaseTitle: t.albums?.title ?? null, duration: t.duration, artworkUrl: null, isPlayable: t.status === 'published' && t.rights_status === 'cleared', loudnessStatus: 'unknown', rightsStatus: t.rights_status ?? 'pending' }))
    }));
  });

  app.post('/playback/token', async (req, reply) => {
    const { trackId } = z.object({ trackId: z.string().uuid() }).parse(req.body);
    const { data: track, error } = await supabase.from('tracks').select('id,status,rights_status,preview_file_key,normalized_file_key,master_file_key').eq('id', trackId).maybeSingle();
    if (error) return reply.code(500).send(err('PLAYBACK_LOOKUP_FAILED', 'Could not fetch track for playback'));
    if (!track) return reply.code(404).send(err('TRACK_NOT_FOUND', 'Track not found'));
    if (track.rights_status !== 'cleared') return reply.code(403).send(err('RIGHTS_NOT_CLEARED', 'Track rights do not allow playback'));
    if (track.status !== 'published') return reply.code(403).send(err('TRACK_NOT_PLAYABLE', 'Track is not playable'));

    const objectKey = track.preview_file_key ?? track.normalized_file_key ?? track.master_file_key;
    if (!objectKey) return reply.code(422).send(err('AUDIO_FILE_MISSING', 'Track has no playback audio file'));

    const playbackUrl = await getSignedUrl(r2, new GetObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: objectKey }), { expiresIn: 900 });
    return reply.send(ok({ trackId, playbackUrl, expiresIn: 900 }));
  });
}
