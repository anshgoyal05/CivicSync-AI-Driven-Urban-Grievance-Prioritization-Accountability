 "use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { Button, Card, Input } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { User } from "@/lib/types";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-sm text-zinc-500">Loading login…</div>}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const { login, refreshMe } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get("next") ?? "/submit";

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values.email, values.password);
      await refreshMe();

      // If an explicit redirect target exists (e.g. protected route), honor it.
      // Otherwise, route admins to admin dashboard and users to submit form.
      if (next && next !== "/submit") {
        router.push(next);
        return;
      }

      const me = await api.get<User>("/auth/me");
      const target = me.data.role === "admin" ? "/admin" : "/submit";
      router.push(target);
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, "Login failed"));
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h2 className="text-xl font-bold">Login</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Access your grievance dashboard.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold">Email</label>
            <Input placeholder="you@example.com" {...form.register("email")} />
            {form.formState.errors.email ? (
              <div className="mt-1 text-xs text-red-600">{form.formState.errors.email.message}</div>
            ) : null}
          </div>
          <div>
            <label className="text-sm font-semibold">Password</label>
            <Input type="password" placeholder="••••••••" {...form.register("password")} />
            {form.formState.errors.password ? (
              <div className="mt-1 text-xs text-red-600">{form.formState.errors.password.message}</div>
            ) : null}
          </div>

          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
            {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-300">
          New here?{" "}
          <Link href="/register" className="font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-300">
            Create an account
          </Link>
        </div>
      </Card>
    </div>
  );
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { detail?: string } } }).response;
    if (response?.data?.detail) return response.data.detail;
  }
  return fallback;
}

