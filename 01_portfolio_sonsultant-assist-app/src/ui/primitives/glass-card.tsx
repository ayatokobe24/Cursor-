import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";
import styles from "./primitives.module.css";

export type GlassCardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  size?: "default" | "large";
  selected?: boolean;
};

export function GlassCard({
  children,
  className,
  size = "default",
  selected = false,
  ...props
}: GlassCardProps) {
  return (
    <section
      {...props}
      data-primitive="GlassCard"
      className={cx(
        styles.glassCard,
        size === "large" && styles.glassCardLarge,
        selected && styles.glassCardSelected,
        className,
      )}
    >
      {children}
    </section>
  );
}
