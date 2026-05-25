export type ConnectUser = {
  id: string;
  email?: string;
  name?: string;
  roles: string[];
  permissions: string[];
  rawClaims: Record<string, unknown>;
};

declare global {
  namespace Express {
    interface Request {
      user?: ConnectUser;
      auth?: {
        userId: string;
        organizationId?: string;
        role?: string;
      };
    }
  }
}

export {};
