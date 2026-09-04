export type AuthError =
  | { kind: "invalidCredentials" }
  | { kind: "unavailable"; message: string };

export type SessionUser = {
  userId: string;
  email: string;
};
