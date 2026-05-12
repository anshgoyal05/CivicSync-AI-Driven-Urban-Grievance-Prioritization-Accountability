"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium backdrop-blur",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  className,
  type = "button",
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-zinc-200/80 bg-white/70 px-3 py-2 text-sm shadow-sm outline-none transition",
        "focus:border-sky-400 focus:ring-2 focus:ring-sky-200/60 dark:focus:border-sky-400 dark:focus:ring-sky-900/40",
        "dark:border-zinc-800 dark:bg-zinc-950/70",
        className,
      )}
    />
  );
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { className?: string }) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-xl border border-zinc-200/80 bg-white/70 px-3 py-2 text-sm shadow-sm outline-none transition",
        "focus:border-sky-400 focus:ring-2 focus:ring-sky-200/60 dark:focus:border-sky-400 dark:focus:ring-sky-900/40",
        "dark:border-zinc-800 dark:bg-zinc-950/70",
        className,
      )}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { className?: string }) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-xl border border-zinc-200/80 bg-white/70 px-3 py-2 text-sm shadow-sm outline-none transition",
        "focus:border-sky-400 focus:ring-2 focus:ring-sky-200/60 dark:focus:border-sky-400 dark:focus:ring-sky-900/40",
        "dark:border-zinc-800 dark:bg-zinc-950/70",
        className,
      )}
    />
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-zinc-200/70 bg-white/70 p-5 shadow-sm backdrop-blur",
        "transition hover:shadow-md hover:shadow-sky-900/5 dark:border-zinc-800/80 dark:bg-zinc-950/70 dark:hover:shadow-sky-500/5",
        className,
      )}
    >
      {children}
    </div>
  );
}

