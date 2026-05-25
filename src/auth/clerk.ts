// Compatibility shim for legacy imports during transition.
export { verifyAccessToken as verifyClerkToken } from './jwt.js';
export type AuthClaims = { sub: string; org_id?: string; email?: string; name?: string };
