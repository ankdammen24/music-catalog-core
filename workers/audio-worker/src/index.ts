/**
 * Audio worker skeleton.
 * Planned lifecycle:
 * 1) Poll queued processing_jobs
 * 2) Download master from R2
 * 3) Normalize audio with FFmpeg
 * 4) Generate preview
 * 5) Upload normalized + preview assets to R2
 * 6) Update Supabase tracks + processing_jobs status
 */

console.log('audio-worker skeleton started');
