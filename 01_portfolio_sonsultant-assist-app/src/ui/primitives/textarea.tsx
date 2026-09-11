import type { TextareaHTMLAttributes } from "react";
import { cx } from "./cx";
import styles from "./primitives.module.css";

export type TextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "children"
> & {
  label: string;
};

export function Textarea({
  className,
  id,
  label,
  ...props
}: TextareaProps) {
  const fieldId = id ?? props.name;

  return (
    <div className={styles.field} data-primitive="Textarea">
      <label className={styles.fieldLabel} htmlFor={fieldId}>
        {label}
      </label>
      <textarea
        {...props}
        id={fieldId}
        className={cx(styles.fieldControl, styles.textarea, className)}
      />
    </div>
  );
}
