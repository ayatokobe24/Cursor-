import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const variantClass = {
  primary: "bg-primary text-white hover:bg-[#3575DD]",
  secondary: "bg-secondary text-white hover:bg-[#606773]",
  outline:
    "border border-primary bg-transparent text-primary hover:bg-[#3B82F61A]",
  ghost: "bg-transparent text-primary hover:bg-[#3B82F61A]",
} as const;

const sizeClass = {
  sm: "h-[32px] px-4 text-[14px]",
  md: "h-[40px] px-6 text-[16px]",
  lg: "h-[48px] px-8 text-[18px]",
} as const;

export type ButtonVariant = keyof typeof variantClass;
export type ButtonSize = keyof typeof sizeClass;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "font-body inline-flex items-center justify-center gap-2 rounded-[6px] font-medium transition-all duration-200 ease-in-out",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <LoaderCircle className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
      ) : null}
      {children}
    </button>
  );
}
