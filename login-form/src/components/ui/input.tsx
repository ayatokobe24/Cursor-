import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

const sizeClass = {
  sm: "h-[32px] text-[14px]",
  md: "h-[40px] text-[16px]",
  lg: "h-[48px] text-[18px]",
} as const;

export type InputSize = keyof typeof sizeClass;

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  error?: string;
  size?: InputSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export function Input({
  label,
  error,
  size = "md",
  leftIcon,
  rightIcon,
  required,
  id,
  className,
  ...props
}: InputProps) {
  const fieldId = id ?? props.name;

  return (
    <div className={cn("font-body flex w-full flex-col gap-1.5", className)}>
      {label ? (
        <label
          htmlFor={fieldId}
          className="flex items-center gap-1 text-[14px] font-medium text-[#374151]"
        >
          {label}
          {required ? (
            <span className="font-semibold text-destructive" aria-hidden>
              *
            </span>
          ) : null}
        </label>
      ) : null}

      <div
        className={cn(
          "flex w-full items-center gap-2 rounded-[6px] border bg-background px-3 transition-all duration-200 ease-in-out",
          sizeClass[size],
          error
            ? "border-destructive"
            : "border-[#D1D5DB] focus-within:border-primary focus-within:shadow-[0_0_0_3px_#3B82F633]",
        )}
      >
        {leftIcon ? (
          <span className="flex shrink-0 text-[#6B7280] [&_svg]:h-4 [&_svg]:w-4">
            {leftIcon}
          </span>
        ) : null}
        <input
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error && fieldId ? `${fieldId}-error` : undefined}
          className="h-full min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-[#9CA3AF]"
          {...props}
        />
        {rightIcon ? (
          <span className="flex shrink-0 text-[#6B7280] [&_svg]:h-4 [&_svg]:w-4">
            {rightIcon}
          </span>
        ) : null}
      </div>

      {error ? (
        <p
          id={fieldId ? `${fieldId}-error` : undefined}
          className="text-[14px] text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
