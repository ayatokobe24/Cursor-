"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/ui/primitives/cx";
import { CORE_NAV_ITEMS, isCoreNavItemActive } from "./nav-items";
import styles from "./shell.module.css";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar} data-part="sidebar">
      <nav className={styles.nav} aria-label="再訪入口">
        <ul className={styles.navList}>
          {CORE_NAV_ITEMS.map((item) => {
            const active = isCoreNavItemActive(item, pathname);

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  data-nav={item.id}
                  className={cx(
                    styles.navLink,
                    active && styles.navLinkActive,
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
