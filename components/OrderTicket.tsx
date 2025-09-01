"use client";
import { useState } from "react";
import { api } from "@/lib/api";

const LEV = [1, 5, 10, 20, 100];

export default function OrderTicket({ asset }: { asset: string }) {
  const [type, setType] = useState<"buy" | "sell">("buy");
  const [marginUsd, setMarginUsd] = useState("100");
  const [lev, setLev] = useState(1);
  const [busy, setBusy] = useState(false);

  async function submit() {
    try {
      setBusy(true);
      const margin = Math.round(parseFloat(marginUsd || "0") * 100); // cents
      await api.createTrade({ asset, type, margin, leverage: lev });
      setMarginUsd("100");
      alert("Order placed");
    } catch (e: any) {
      alert(e?.message || "Order failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-4">
      <div className="mb-2 text-sm opacity-80">Order — {asset}</div>
      <div className="flex gap-2 mb-2">
        <button className={`btn ${type === "buy" ? "bg-emerald-600 border-emerald-700" : ""}`} onClick={() => setType("buy")}>Buy</button>
        <button className={`btn ${type === "sell" ? "bg-rose-600 border-rose-700" : ""}`} onClick={() => setType("sell")}>Sell</button>
      </div>
      <label className="text-sm">Margin (USD)</label>
      <input className="w-full mt-1 mb-3 px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700"
        value={marginUsd} onChange={(e) => setMarginUsd(e.target.value)} />
      <label className="text-sm">Leverage</label>
      <select className="w-full mt-1 mb-4 px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700"
        value={lev} onChange={(e) => setLev(parseInt(e.target.value))}>
        {LEV.map((x) => <option key={x} value={x}>{x}x</option>)}
      </select>
      <button disabled={busy} className="btn w-full bg-blue-600 border-blue-700 hover:bg-blue-500" onClick={submit}>
        {busy ? "Placing..." : "Place Order"}
      </button>
    </div>
  );
}
