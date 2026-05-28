"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/lib/auth";
import { toast } from "@/lib/toast";
import type { User } from "@/lib/types";

export function useGoogleSignIn() {
  const { completeLogin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [busy, setBusy] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleCredential = useCallback(
    async (credential: string) => {
      setBusy(true);
      try {
        const res = await api.post<{ access_token: string }>("/auth/google", {
          id_token: credential,
        });
        completeLogin(res.data.access_token);
        const me = await api.get<User>("/auth/me");
        const target =
          next && next !== "/submit"
            ? next
            : me.data.role === "admin"
              ? "/admin"
              : "/submit";
        router.push(target);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Google sign-in failed"));
      } finally {
        setBusy(false);
      }
    },
    [completeLogin, next, router],
  );

  const onDigiLockerClick = () => {
    toast.error(
      "DigiLocker is not available yet. It requires official Government API credentials.",
    );
  };

  return { clientId, busy, handleCredential, onDigiLockerClick };
}
