"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const inner = (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        {children}
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  );

  if (!googleClientId) return inner;

  return <GoogleOAuthProvider clientId={googleClientId}>{inner}</GoogleOAuthProvider>;
}
