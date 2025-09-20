"use client";
import { useState } from "react";
import { usePrices } from "@/store/prices";
import { priceStr } from "@/lib/format";
import { api } from "@/lib/api";

const LEV = [1, 5, 10, 20, 100] as const;

export default function OrderPanel({ asset }: { asset: string }) {
  const p = usePrices((s) => s.map[asset]);
  const [side, setSide] = useState<"long" | "short">("long");
  const [marginUsd, setMarginUsd] = useState("100");
  const [lev, setLev] = useState<number>(1);
  const [sl, setSL] = useState<string>(""); // price (optional)
  const [tp, setTP] = useState<string>(""); // price (optional)
  const [busy, setBusy] = useState(false);

  const decimals = p?.decimals ?? 4;

  const exposure = (parseFloat(marginUsd || "0") || 0) * lev;
  const sideColor = side === "long" ? "bg-emerald-600" : "bg-rose-600";

  async function place() {
    setBusy(true);
    try {
      const margin = Math.round((parseFloat(marginUsd || "0") || 0) * 100); // cents
      const body: any = {
        asset,
        type: side === "long" ? "buy" : "sell",
        margin,
        leverage: lev,
      };
      if (sl) body.stopLoss = Math.round(Number(sl) * 10 ** decimals);
      if (tp) body.takeProfit = Math.round(Number(tp) * 10 ** decimals);

      await api.createTrade(body);
      alert("Order placed");
      setSL(""); setTP("");
    } catch (e: any) {
      alert(e?.message || "Order failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="h-full p-3 flex flex-col space-y-3">
      <div className="flex items-center justify-between text-sm">
        <div className="opacity-70">{asset}/USDT</div>
        <div className="font-semibold">
          {p ? priceStr(side === "long" ? p.buyPrice : p.sellPrice, p.decimals) : "—"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button className={`px-3 py-2 rounded-xl ${side === "long" ? "bg-emerald-600" : "bg-neutral-800 border border-neutral-700"}`} onClick={() => setSide("long")}>Long</button>
        <button className={`px-3 py-2 rounded-xl ${side === "short" ? "bg-rose-600" : "bg-neutral-800 border border-neutral-700"}`} onClick={() => setSide("short")}>Short</button>
      </div>

      <div>
        <div className="mb-1 text-sm opacity-70">Margin (USD)</div>
        <input value={marginUsd} onChange={(e) => setMarginUsd(e.target.value)} className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2" />
      </div>

      <div>
        <div className="mb-1 text-sm opacity-70">Leverage</div>
        <select value={lev} onChange={(e) => setLev(parseInt(e.target.value))} className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2">
          {LEV.map((x) => <option key={x} value={x}>{x}x</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="mb-1 text-sm opacity-70">Stop Loss (price)</div>
          <input value={sl} onChange={(e) => setSL(e.target.value)} placeholder="e.g. 42750" className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2" />
        </div>
        <div>
          <div className="mb-1 text-sm opacity-70">Take Profit (price)</div>
          <input value={tp} onChange={(e) => setTP(e.target.value)} placeholder="e.g. 45200" className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2" />
        </div>
      </div>

      <div className="text-xs opacity-70">
        Exposure: <span className="font-semibold">${exposure.toFixed(2)}</span>
      </div>

      <button disabled={busy} className={`mt-auto w-full rounded-xl py-2 ${sideColor}`} onClick={place}>
        {busy ? "Submitting..." : side === "long" ? "Open Long" : "Open Short"}
      </button>
    </div>
  );
}
