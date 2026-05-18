# ARCHITECTURE
- soundloom-core använder detta API som backend.
- radio-core är separat broadcast console.

## Dataflöde upload
Frontend begär `/uploads/presign` -> laddar till R2 staging -> kallar `/uploads/complete` -> track status uploaded.

## Dataflöde processing
`/processing/tracks/:trackId/queue` skapar queued-jobb -> worker hämtar från R2 -> ffprobe/loudness/flac -> laddar FLAC till R2 -> uppdaterar tracks + processing_jobs.

## R2 key-struktur
- staging/uploads/{organizationId}/{trackId}/{filename}
- masters/originals/{organizationId}/{trackId}/{filename}
- masters/flac/{organizationId}/{trackId}/{trackId}.flac
- artwork/{organizationId}/{releaseId}/cover.jpg
- exports/{organizationId}/{releaseId}/

## Statusmodell
release: draft -> ready_for_review -> approved -> distributed -> archived.
track: draft -> uploaded -> processing -> processed -> approved/rejected -> archived.

## Security boundaries
- Clerk JWT verifiering på alla skyddade routes.
- Organization isolation via org-id från token + DB-filter.
- Endast backend hanterar Supabase service role, Clerk secret, R2 secret.
- Signed URLs används för upload/download.
