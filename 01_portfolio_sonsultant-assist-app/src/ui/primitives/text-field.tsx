import type { InputHTMLAttributes } from "react";
import { cx } from "./cx";
import styles from "./primitives.module.css";

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "children"> & {
  label: string;
};

export function TextField({
  className,
  id,
  label,
  type = "text",
  ...props
}: TextFieldProps) {
  const fieldId = id ?? props.name;

  return (
    <div className={styles.field} data-primitive="TextField">
      <label className={styles.fieldLabel} htmlFor={fieldId}>
        {label}
      </label>
      <input
        {...props}
        id={fieldId}
        type={type}
        className={cx(styles.fieldControl, className)}
      />
    </div>
  );
}
