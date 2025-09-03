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
    <header className="h-14 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur flex items-center px-3 gap-4">
      <Link className="font-black text-yellow-400" href="/">exness</Link>
      <Link className="text-sm opacity-80 hover:opacity-100" href="/orders">Orders</Link>
      <div className="ml-auto flex items-center gap-3">
        <span className="text-sm opacity-80">Balance: {bal}</span>
        {!token ? (
          <>
            <Link className="btn" href="/signup">Signup</Link>
            <Link className="btn" href="/login">Login</Link>
          </>
        ) : (
          <button className="btn" onClick={()=>setToken(undefined)}>Logout</button>
        )}
      </div>
    </header>
  );
}
