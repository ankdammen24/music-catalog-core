# Auth

Autentisering hanteras av Microsoft Entra External ID via frontend (MSAL Browser).

Backend/API-gateway för auth är:

- `https://connect.mediarosenqvist.com`

## Token till API

Frontend ska skicka access token i Authorization-headern:

`Authorization: Bearer <entra_access_token>`

Token ska vara utfärdad för audience:

- `api://a523e8c6-0ef0-42f3-aa97-4b465bf78642`

## Verifiering

Skyddad test-endpoint:

- `GET /auth/me`

Exempel:

```http
GET https://connect.mediarosenqvist.com/auth/me
Authorization: Bearer <entra_access_token>
```

Responsen används av frontend för att visa användarprofil (namn/e-post/roller) och för att avgöra åtkomst till skyddade admin-vyer.
