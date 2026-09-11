export type CoreNavItemId = "new-consult" | "in-progress" | "reflect";

export type CoreNavItem = {
  id: CoreNavItemId;
  label: "新しい相談" | "進行中の相談" | "振り返り";
  href: "/consult/new";
};

export const CORE_NAV_ITEMS: readonly CoreNavItem[] = [
  { id: "new-consult", label: "新しい相談", href: "/consult/new" },
  { id: "in-progress", label: "進行中の相談", href: "/consult/new" },
  { id: "reflect", label: "振り返り", href: "/consult/new" },
];

export function isCoreNavItemActive(
  item: CoreNavItem,
  pathname: string,
): boolean {
  if (item.id === "new-consult") {
    return pathname === "/consult/new";
  }

  if (item.id === "in-progress") {
    return pathname.startsWith("/consult/") && pathname !== "/consult/new";
  }

  return pathname.startsWith("/reflect/");
}
