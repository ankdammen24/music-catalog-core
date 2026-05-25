# Frontend integration (Media Rosenqvist Connect + Microsoft Entra External ID)

Den här backenden använder nu `connect.mediarosenqvist.com` som auth-backend/API-gateway.

## Miljövariabler i frontend

Konfigurera följande i frontend-applikationen:

```bash
VITE_AUTH_API_URL=https://connect.mediarosenqvist.com
VITE_ENTRA_CLIENT_ID=<entra-app-client-id>
VITE_ENTRA_AUTHORITY=<https://<tenant>.ciamlogin.com/<tenant-id> eller motsvarande authority>
VITE_ENTRA_AUDIENCE=api://a523e8c6-0ef0-42f3-aa97-4b465bf78642
```

## Krav på auth-flöde

Frontend ska:

- använda `@azure/msal-browser`
- använda **Authorization Code Flow med PKCE**
- hantera redirect callback på `/auth/callback`
- visa login/logout-knappar
- skydda admin-sidor bakom inloggning
- visa tydligt fel om token saknas eller är ogiltig

## Rekommenderad MSAL-konfiguration

```ts
import { PublicClientApplication, type Configuration } from '@azure/msal-browser';

const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_ENTRA_CLIENT_ID,
    authority: import.meta.env.VITE_ENTRA_AUTHORITY,
    redirectUri: `${window.location.origin}/auth/callback`
  },
  cache: {
    cacheLocation: 'sessionStorage'
  }
};

export const msalInstance = new PublicClientApplication(msalConfig);
```

## Scope/resource för access token

Begär token för API-audience:

```ts
const tokenRequest = {
  scopes: [`${import.meta.env.VITE_ENTRA_AUDIENCE}/.default`]
};
```

> Om er Entra-konfiguration kräver explicita scopes istället för `/.default`, använd de scopes som publicerats på API-appen med audience `api://a523e8c6-0ef0-42f3-aa97-4b465bf78642`.

## Verifiera inloggad användare via Connect

Anropa skyddad endpoint:

```http
GET https://connect.mediarosenqvist.com/auth/me
Authorization: Bearer <access_token>
```

Förväntat frontend-beteende:

- hämta access token via `acquireTokenSilent` (fallback: redirect/popup enligt appens UX)
- kalla `${VITE_AUTH_API_URL}/auth/me` med Bearer-token
- visa användarens namn, e-post och roller i UI

## Exempel: /auth/me-anrop

```ts
export async function fetchCurrentUser(accessToken: string) {
  if (!accessToken) {
    throw new Error('Access token saknas. Logga in igen.');
  }

  const response = await fetch(`${import.meta.env.VITE_AUTH_API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Ogiltig eller utgången token. Logga in igen.');
  }

  return response.json() as Promise<{
    name?: string;
    email?: string;
    roles?: string[];
  }>;
}
```

## Skydda admin-sidor

- Kräv aktiv session innan admin-routes renderas.
- Om användaren saknar token eller `/auth/me` returnerar 401/403: redirect till login och visa ett tydligt felmeddelande.

