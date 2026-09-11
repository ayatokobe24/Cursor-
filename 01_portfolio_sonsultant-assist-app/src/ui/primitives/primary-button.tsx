import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";
import styles from "./primitives.module.css";

export type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function PrimaryButton({
  children,
  className,
  type = "button",
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      {...props}
      type={type}
      data-primitive="PrimaryButton"
      className={cx(styles.primaryButton, className)}
    >
      {children}
    </button>
  );
}
