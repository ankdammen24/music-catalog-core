export const releaseStatuses = ["draft", "ready_for_review", "approved", "distributed", "archived"] as const;
export const trackStatuses = ["draft", "uploaded", "processing", "processed", "approved", "rejected", "archived"] as const;
export const uploadJobStatuses = ["pending", "uploaded", "failed"] as const;
export const processingJobStatuses = ["queued", "running", "completed", "failed"] as const;

export type ReleaseStatus = (typeof releaseStatuses)[number];
export type TrackStatus = (typeof trackStatuses)[number];
