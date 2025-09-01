"use client";
import { create } from "zustand";
type Auth = { token?: string; setToken: (t?: string) => void };
export const useAuth = create<Auth>((set) => ({
  token: undefined,
  setToken: (t) => {
    if (typeof window !== "undefined") {
      if (t) localStorage.setItem("token", t);
      else localStorage.removeItem("token");
    }
    set({ token: t });
  }
}));
