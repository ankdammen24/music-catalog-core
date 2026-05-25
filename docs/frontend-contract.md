# Frontend contract

## Authentication flow

- Frontend loggar in användaren via Microsoft Entra External ID med MSAL Browser.
- Flow: Authorization Code + PKCE.
- Frontend hämtar access token för `api://a523e8c6-0ef0-42f3-aa97-4b465bf78642`.
- Frontend skickar token till Connect auth-backend:

```http
Authorization: Bearer <entra_access_token>
```

- Connect verifierar JWT och returnerar användarens profil/roller via `GET /auth/me`.

## Required frontend env vars

- `VITE_AUTH_API_URL`
- `VITE_ENTRA_CLIENT_ID`
- `VITE_ENTRA_AUTHORITY`
- `VITE_ENTRA_AUDIENCE`

## Required frontend UX

- Login-knapp
- Logout-knapp
- Redirect callback route: `/auth/callback`
- Tydligt fel i UI när token saknas eller är ogiltig
- Admin-sidor ska kräva inloggning
