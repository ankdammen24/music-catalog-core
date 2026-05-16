# Audio ingest flow

## 1) Staging upload
Clients upload original source audio to the existing masters bucket using a staging key:

- Bucket: `mrq-music-masters`
- Key: `staging/uploads/{trackId}/{originalFileName}`

`POST /uploads/presign` defaults audio track uploads to `bucketType=staging`.

## 2) Upload completion
`POST /uploads/complete` for staging uploads should:

- persist `staged_file_key` / `original_file_key` with the staging key
- set track `status=staged`
- set track `processing_status=queued`
- create `processing_jobs` row:
  - `job_type=audio_ingest`
  - `status=queued`
  - `track_id={trackId}`

## 3) Worker processing
`audio-worker` consumes queued `audio_ingest` jobs and:

- marks job `processing`
- downloads staged file from `mrq-music-masters`
- extracts ffprobe metadata
- runs EBU R128 loudness analysis
- validates loudness and technical properties
- normalizes when needed
- generates:
  - streaming FLAC
  - radio FLAC
  - preview MP3
  - optional waveform JSON

Uploads outputs to existing buckets:

- `mrq-music-masters`: `masters/{artistId}/{trackId}/original/{originalFileName}`
- `mrq-music-normalized`: `streaming/{trackId}/master.flac`
- `mrq-music-normalized`: `radio/{trackId}/radio.flac`
- `mrq-music-previews`: `previews/{trackId}/preview.mp3`
- `mrq-music-normalized`: `waveforms/{trackId}/waveform.json`

## 4) Completion state
After successful processing:

- track `status=approved` or `needs_review` (based on validation)
- track `processing_status=completed`
- `processing_jobs.status=completed`

Staged files are currently retained (no automatic deletion yet).
