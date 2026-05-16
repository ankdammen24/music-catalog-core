# Auth
Clerk JWT is verified by API middleware. Supabase Auth is not used.

Frontend (`soundloom-core`) calls protected routes with:

`Authorization: Bearer <clerk_token>`

`AUTH_DISABLED=true` is supported for local development only (non-production).
