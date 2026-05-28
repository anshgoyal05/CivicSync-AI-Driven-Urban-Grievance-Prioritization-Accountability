"use client";

import { Suspense } from "react";
import { GoogleLogin } from "@react-oauth/google";

import { useGoogleSignIn } from "@/hooks/use-google-sign-in";
import { toast } from "@/lib/toast";

function SocialSignInInner() {
  const { clientId, busy, handleCredential, onDigiLockerClick } = useGoogleSignIn();

  return (
    <div className="grid grid-cols-2 gap-3">
      {clientId ? (
        <div className="relative min-h-[48px]">
          <button
            type="button"
            disabled={busy}
            className="pointer-events-none flex h-full w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background py-3 text-sm font-medium text-foreground opacity-100"
            tabIndex={-1}
            aria-hidden
          >
            <GoogleIcon />
            Google
          </button>
          <div className="absolute inset-0 z-10 overflow-hidden rounded-2xl opacity-0 [&_iframe]:!h-full [&_iframe]:!w-full">
            <GoogleLogin
              onSuccess={(response) => {
                if (response.credential) void handleCredential(response.credential);
              }}
              onError={() => toast.error("Google sign-in was cancelled or failed")}
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
              width="400"
            />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() =>
            toast.error(
              "Google sign-in is not configured. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to frontend/.env.local and GOOGLE_CLIENT_ID to the backend.",
            )
          }
          className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-background py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <GoogleIcon />
          Google
        </button>
      )}

      <button
        type="button"
        onClick={onDigiLockerClick}
        className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-background py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.053 5.56-5.023c.242-.213-.054-.334-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.538-.194 1.006.13.827.942z" />
        </svg>
        DigiLocker
      </button>
    </div>
  );
}

export function SocialSignIn() {
  return (
    <Suspense fallback={<div className="h-12 animate-pulse rounded-2xl bg-secondary" />}>
      <SocialSignInInner />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
