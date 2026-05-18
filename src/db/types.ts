export interface AuthContext {
  clerkUserId: string;
  clerkOrgId: string;
  organizationId: string;
  userId?: string;
}

export interface AuthenticatedRequest {
  auth: AuthContext;
}
