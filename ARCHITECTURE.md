# Architecture
- `music-catalog-core` är backendkärnan som används av `soundloom-core` frontend.
- `radio-core` är separat broadcast operations console.
## Upload flow
Frontend begär `/uploads/presign` -> upload till R2 -> `/uploads/complete` -> track status `uploaded`.
## Processing flow
Frontend/API köar `/processing/tracks/:trackId/queue` -> worker hämtar queued job -> laddar från R2 -> ffprobe + FLAC transcode -> uppdaterar `tracks` + `processing_jobs`.
## R2 key-struktur
- `staging/uploads/{organizationId}/{trackId}/{filename}`
- `masters/originals/{organizationId}/{trackId}/{filename}`
- `masters/flac/{organizationId}/{trackId}/{trackId}.flac`
- `artwork/{organizationId}/{releaseId}/cover.jpg`
- `exports/{organizationId}/{releaseId}/`
## Statusmodell
- release: draft -> ready_for_review -> approved -> distributed -> archived
- track: draft -> uploaded -> processing -> processed -> approved/rejected -> archived
- upload_jobs: pending/uploaded/failed
- processing_jobs: queued/running/completed/failed
## Security boundaries
- Clerk JWT på alla endpoint utom health.
- Service role key endast backend.
- R2 access keys endast backend.
- Org-isolering i alla DB queries via organization_id från server-side auth context.
