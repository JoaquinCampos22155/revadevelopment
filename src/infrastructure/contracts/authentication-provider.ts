/** Identifies the only authenticated state needed before authorization requirements are approved. */
export type AuthenticatedUser = Readonly<{
  id: string;
}>;

/** Defines the provider boundary for session identity without introducing authorization or roles. */
export interface AuthenticationProvider {
  getAuthenticatedUser(): Promise<AuthenticatedUser | null>;
}
