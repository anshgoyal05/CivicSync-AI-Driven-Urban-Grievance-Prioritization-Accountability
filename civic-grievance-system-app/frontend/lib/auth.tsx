"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "@/lib/toast";

import { api, setAuthToken } from "@/lib/api";
import type { User } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  completeLogin: (accessToken: string) => void;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "civic_auth_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const existing = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (existing) {
      setToken(existing);
      setAuthToken(existing);
    }
    setLoading(false);
  }, []);

  const refreshMe = async () => {
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const res = await api.get<User>("/auth/me");
      setUser(res.data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    void refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const completeLogin = (t: string) => {
    localStorage.setItem(TOKEN_KEY, t);
    setAuthToken(t);
    setToken(t);
    toast.success("Logged in");
  };

  const login = async (email: string, password: string) => {
    const res = await api.post<{ access_token: string; token_type: string }>(
      "/auth/login",
      { email, password },
    );
    completeLogin(res.data.access_token);
  };

  const register = async (name: string, email: string, password: string) => {
    await api.post("/auth/register", { name, email, password });
    toast.success("Account created. Please login.");
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setToken(null);
    setUser(null);
    toast.success("Logged out");
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, login, register, completeLogin, logout, refreshMe }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

