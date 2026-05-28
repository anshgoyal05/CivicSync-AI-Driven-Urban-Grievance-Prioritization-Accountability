"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/lib/auth";
import { toast } from "@/lib/toast";
import type { User } from "@/lib/types";

const REMEMBER_EMAIL_KEY = "civic_remember_email";

type Options = {
  onRegistered?: () => void;
};

export function useLoginFlow(options?: Options) {
  const { login, register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  const redirectAfterAuth = async () => {
    const me = await api.get<User>("/auth/me");
    const target =
      next && next !== "/submit"
        ? next
        : me.data.role === "admin"
          ? "/admin"
          : "/submit";
    router.push(target);
  };

  const submitLogin = async () => {
    setBusy(true);
    try {
      await login(email.trim(), password);
      if (rememberMe) localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
      else localStorage.removeItem(REMEMBER_EMAIL_KEY);
      await redirectAfterAuth();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Login failed"));
    } finally {
      setBusy(false);
    }
  };

  const submitRegister = async () => {
    if (!name.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setBusy(true);
    try {
      await register(name.trim(), email.trim(), password);
      options?.onRegistered?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Registration failed"));
    } finally {
      setBusy(false);
    }
  };

  const onForgotPassword = () => {
    toast.error(
      "Password reset is not enabled yet. Contact your municipal admin or register a new account with a different email.",
    );
  };

  return {
    busy,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    submitLogin,
    submitRegister,
    onForgotPassword,
  };
}
