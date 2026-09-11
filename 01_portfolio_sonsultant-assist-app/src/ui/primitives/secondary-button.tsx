import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";
import styles from "./primitives.module.css";

export type SecondaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function SecondaryButton({
  children,
  className,
  type = "button",
  ...props
}: SecondaryButtonProps) {
  return (
    <button
      {...props}
      type={type}
      data-primitive="SecondaryButton"
      className={cx(styles.secondaryButton, className)}
    >
      {children}
    </button>
  );
}
