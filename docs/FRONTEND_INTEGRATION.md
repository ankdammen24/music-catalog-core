# Lovable frontend integration guide

## Frontend env variables
- `VITE_API_BASE_URL=https://catalog.mediarosenqvist.com`
- `VITE_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>`

## Bearer token usage
Frontend should send Clerk session token in `Authorization` header:

```ts
const token = await clerk.session?.getToken();
await fetch(`${import.meta.env.VITE_API_BASE_URL}/artists`, {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});
```

## Example requests
```ts
await fetch(`${import.meta.env.VITE_API_BASE_URL}/uploads/presign`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    trackId: "<uuid>",
    filename: "demo.wav",
    contentType: "audio/wav",
  }),
});
```

```ts
await fetch(`${import.meta.env.VITE_API_BASE_URL}/artists`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

## CORS
Backend accepts origins from `CORS_ORIGINS` (comma-separated), currently intended for:
- `https://catalog.mediarosenqvist.com`
- `https://soundloom-core.lovable.app`
- `https://*.lovable.app`
- future production frontend domain

## Endpoints ready for frontend
- `GET /health`
- `GET /artists`
- `POST /artists`
- `GET /releases`
- `POST /releases`
- `GET /tracks`
- `POST /tracks`
- `POST /uploads/presign`
- `POST /uploads/complete`
