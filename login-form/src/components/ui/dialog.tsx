"use client";

import { X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { Button, type ButtonProps } from "./button";

type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
};

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog の子コンポーネントは Dialog 内で使ってください。");
  }
  return context;
}

export type DialogProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
};

export function Dialog({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
}: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolledOpen;
  const titleId = useId();
  const descriptionId = useId();

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  return (
    <DialogContext.Provider
      value={{ open: isOpen, setOpen, titleId, descriptionId }}
    >
      {children}
    </DialogContext.Provider>
  );
}

export type DialogTriggerProps = ButtonProps;

export function DialogTrigger({
  children,
  onClick,
  ...props
}: DialogTriggerProps) {
  const { setOpen } = useDialog();

  return (
    <Button
      {...props}
      onClick={(event) => {
        onClick?.(event);
        setOpen(true);
      }}
    >
      {children}
    </Button>
  );
}

export type DialogContentProps = HTMLAttributes<HTMLDivElement>;

export function DialogContent({
  className,
  children,
  ...props
}: DialogContentProps) {
  const { open, setOpen, titleId, descriptionId } = useDialog();

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, setOpen]);

  if (!open) {
    return null;
  }

  const onBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setOpen(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(
          "font-body relative w-full max-w-[420px] overflow-hidden rounded-[8px] border border-[#E5E7EB] bg-background shadow-[0_1px_3px_rgba(0,0,0,0.1)]",
          className,
        )}
        {...props}
      >
        <button
          type="button"
          aria-label="閉じる"
          className="absolute top-3 right-3 rounded-[6px] p-1 text-[#6B7280] transition-all duration-200 ease-in-out hover:bg-[#3B82F61A] hover:text-foreground"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 border-b border-[#E5E7EB] px-5 py-4 pr-12",
        className,
      )}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  const { titleId } = useDialog();

  return (
    <h2
      id={titleId}
      className={cn(
        "text-[18px] leading-snug font-semibold text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  const { descriptionId } = useDialog();

  return (
    <p
      id={descriptionId}
      className={cn("text-[14px] leading-[1.4] text-[#6B7280]", className)}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 border-t border-[#E5E7EB] px-5 py-4",
        className,
      )}
      {...props}
    />
  );
}

export function DialogClose({ children, onClick, ...props }: ButtonProps) {
  const { setOpen } = useDialog();

  return (
    <Button
      {...props}
      onClick={(event) => {
        onClick?.(event);
        setOpen(false);
      }}
    >
      {children}
    </Button>
  );
}
