"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { Button, Card, Input } from "@/components/ui";
import { useAuth } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await registerUser(values.name, values.email, values.password);
      router.push("/login");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Registration failed");
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h2 className="text-xl font-bold">Create account</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Register to submit and track grievances.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold">Name</label>
            <Input placeholder="Your name" {...form.register("name")} />
            {form.formState.errors.name ? (
              <div className="mt-1 text-xs text-red-600">{form.formState.errors.name.message}</div>
            ) : null}
          </div>
          <div>
            <label className="text-sm font-semibold">Email</label>
            <Input placeholder="you@example.com" {...form.register("email")} />
            {form.formState.errors.email ? (
              <div className="mt-1 text-xs text-red-600">{form.formState.errors.email.message}</div>
            ) : null}
          </div>
          <div>
            <label className="text-sm font-semibold">Password</label>
            <Input type="password" placeholder="Min 8 characters" {...form.register("password")} />
            {form.formState.errors.password ? (
              <div className="mt-1 text-xs text-red-600">{form.formState.errors.password.message}</div>
            ) : null}
          </div>

          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
            {form.formState.isSubmitting ? "Creating…" : "Create account"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-300">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-300">
            Login
          </Link>
        </div>
      </Card>
    </div>
  );
}

