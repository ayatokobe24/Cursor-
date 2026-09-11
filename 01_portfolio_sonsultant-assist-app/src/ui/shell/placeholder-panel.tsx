import type { ReactNode } from "react";
import { GlassCard } from "@/ui/primitives";
import styles from "./shell.module.css";

export type PlaceholderPanelProps = {
  kicker: string;
  title: string;
  children: ReactNode;
};

export function PlaceholderPanel({
  kicker,
  title,
  children,
}: PlaceholderPanelProps) {
  return (
    <GlassCard size="large">
      <div className={styles.placeholderStack}>
        <p className={styles.placeholderKicker}>{kicker}</p>
        <h1 className={styles.placeholderTitle}>{title}</h1>
        {children}
      </div>
    </GlassCard>
  );
}
