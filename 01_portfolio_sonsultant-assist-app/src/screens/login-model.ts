export type LoginDestination = "/consent" | "/consult/new";

export function routeAfterSuccessfulSignIn(
  consented: boolean,
): LoginDestination {
  return consented ? "/consult/new" : "/consent";
}

export function isMockCredentialRejected(password: string): boolean {
  return password.trim().length === 0;
}
