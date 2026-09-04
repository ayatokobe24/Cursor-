type AuthUser = { id: string } | null;

export type AuthNavigation =
  | { action: "next" }
  | { action: "redirect"; pathname: "/login" | "/" };

export function decideAuthNavigation(
  pathname: string,
  user: AuthUser,
): AuthNavigation {
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isAuthCallback = pathname.startsWith("/auth/");

  if (!user && !isAuthPage && !isAuthCallback) {
    return { action: "redirect", pathname: "/login" };
  }

  if (user && isAuthPage) {
    return { action: "redirect", pathname: "/" };
  }

  return { action: "next" };
}
