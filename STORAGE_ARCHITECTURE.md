# Storage Architecture

## End-to-end upload pipeline

1. `POST /uploads/init` creates a temporary upload key and returns a signed upload URL.
2. Client uploads directly to object storage.
3. `POST /uploads/complete` marks uploaded asset, creates a processing job, and enqueues the job in Redis.
4. Audio worker pulls queued jobs, validates/probes audio, normalizes via ffmpeg, analyzes loudness, converts to FLAC, generates waveform PNG and preview MP3.
5. Worker writes normalized outputs to storage and updates track/asset/job state.

## Processing states

Track states used by the pipeline:
- `uploaded`
- `validating`
- `processing`
- `ready`
- `failed`

## Provider abstraction

The backend supports:
- Cloudflare R2
- AWS S3
- Azure Blob

Provider selection is controlled by `STORAGE_PROVIDER`.

## Operational endpoints

- `GET /health/storage`
- `GET /api/storage/health`
- `POST /debug/storage-upload-test`
- `GET /processing/dashboard`
- `POST /processing/jobs/:id/retry`

## Security notes

- Database stores object keys, not permanent public URLs.
- Signed URLs are short-lived and generated server-side.
