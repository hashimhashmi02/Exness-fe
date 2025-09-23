"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
export default function SignupPage() {
  const [email, setEmail] = useState("u@ex.com");
  const [password, setPassword] = useState("secret123");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit() {
    try {
      setBusy(true);
      await api.signup({ email, password });
      alert("Signup ok, please login");
      router.push("/login");
    } catch (e:any) { alert(e?.message || "Signup has failed"); }
    finally { setBusy(false); }
  }

  return (
    <div className="max-w-md mx-auto card p-5 mt-10">
      <h1 className="text-lg font-semibold mb-4">Signup</h1>
      <input className="w-full mb-2 px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700"
        placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full mb-4 px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700"
        placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button className="btn w-full bg-blue-600 border-blue-700" disabled={busy} onClick={submit}>
        {busy ? "Creating..." : "Create account"}
      </button>
    </div>
  );
}
