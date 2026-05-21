# CORS & API Troubleshooting

## curl test with Origin header

```bash
curl -i https://api.mediarosenqvist.com/cors-test \
  -H "Origin: https://soundloom-core.lovable.app"
```

Expected:
- `HTTP/1.1 200`
- `Access-Control-Allow-Origin: https://soundloom-core.lovable.app`
- `X-API-Service: music-catalog-core`
- `X-API-Version: <current version>`

## Browser fetch test

Run in browser console on one of the allowed frontend origins:

```js
fetch('https://api.mediarosenqvist.com/cors-test', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
})
  .then((r) => r.json())
  .then(console.log)
  .catch(console.error);
```

Expected response:

```json
{
  "ok": true,
  "origin": "https://soundloom-core.lovable.app",
  "cors": "enabled"
}
```

## Cloudflare DNS-only test

If CORS appears broken in production:

1. Set `api.mediarosenqvist.com` to **DNS only** (grey cloud) temporarily.
2. Re-run curl preflight and GET checks directly against origin.
3. If CORS works DNS-only but fails proxied, review Cloudflare Transform Rules/WAF/Workers.
4. Restore proxy setting after test.

## CORS checklist

- `CORS_ORIGINS` includes all production frontends:
  - `https://soundloom-core.lovable.app`
  - `https://catalog.mediarosenqvist.com`
  - `https://soundloom.mediarosenqvist.com`
- API allows methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`.
- API allows headers: `Content-Type, Authorization`.
- API preflight (`OPTIONS`) returns success and CORS headers.
- API does **not** use wildcard `*` with credentials.
- Health routes (`/health*`) and `/cors-test` are publicly accessible.
