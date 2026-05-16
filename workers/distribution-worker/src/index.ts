/**
 * Distribution worker skeleton.
 * Future responsibilities:
 * - read approved releases from Supabase
 * - generate/export metadata payloads to R2
 * - fan out delivery jobs to distributor integrations
 * - track delivery status/errors back into Supabase
 */

console.log('distribution-worker skeleton started');
