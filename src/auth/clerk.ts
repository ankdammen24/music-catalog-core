// Clerk compatibility shim — re-export internal verify so existing imports keep working during migration
export { verifyAccessToken as verifyClerkToken } from './jwt.js';
export type AuthClaims = { sub: string; org_id?: string; email?: string; name?: string };
