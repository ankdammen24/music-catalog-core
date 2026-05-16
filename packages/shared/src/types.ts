export type Track = {
  id: string;
  title: string;
  artistId: string;
  releaseId?: string | null;
  durationMs?: number | null;
  objectKey?: string | null;
};

export type Artist = {
  id: string;
  name: string;
  slug?: string | null;
};

export type Release = {
  id: string;
  title: string;
  artistId: string;
  releaseDate?: string | null;
};

export type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
};

export type PlaybackTokenResponse = {
  trackId: string;
  token: string;
  expiresAt: string;
  streamUrl: string;
};
