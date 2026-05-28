"use client";

import { X } from "lucide-react";
import { MotionDiv } from "@/components/Motion";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close modal"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <MotionDiv
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "w-full max-w-3xl overflow-hidden rounded-3xl border border-zinc-200/70 bg-white/90 shadow-xl backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/85",
            className,
          )}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between border-b border-zinc-200/60 px-5 py-4 dark:border-zinc-800/70">
            <div className="text-sm font-semibold">{title ?? "Preview"}</div>
            <button
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200/70 bg-white/70 text-zinc-700 shadow-sm transition hover:bg-white active:scale-[0.98] dark:border-zinc-800/80 dark:bg-zinc-950/70 dark:text-zinc-200 dark:hover:bg-zinc-900"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
          <div className="p-5">{children}</div>
        </MotionDiv>
      </div>
    </div>
  );
}

