"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { dollars } from "@/lib/format";
import { useAuth } from "@/store/auth";

export default function NavBar() {
  const { token, setToken } = useAuth();
  const [bal, setBal] = useState<string>("—");

  useEffect(() => {
    if (!token) return setBal("—");
    api.balance().then(r => setBal(`$${dollars(r.usd_balance)}`)).catch(()=>setBal("—"));
  }, [token]);

  return (
    <header className="sticky top-0 z-10 backdrop-blur border-b border-neutral-800 bg-neutral-950/60">
      <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
        <Link className="font-semibold" href="/">Exness</Link>
        <Link className="text-sm opacity-80 hover:opacity-100" href="/orders">Orders</Link>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm opacity-80">Balance: {bal}</span>
          {!token ? (
            <>
              <Link className="btn" href="/signup">Signup</Link>
              <Link className="btn" href="/login">Login</Link>
            </>
          ) : (
            <button className="btn" onClick={() => setToken(undefined)}>Logout</button>
          )}
        </div>
      </nav>
    </header>
  );
}
