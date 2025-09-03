"use client";
import { useState } from "react";
import { usePrices } from "@/store/prices";
import { priceStr } from "@/lib/format";
import { api } from "@/lib/api";

const LEV = [1,5,10,20,100] as const;

export default function OrderPanel({ asset }: { asset: string }) {
  const p = usePrices(s => s.map[asset]);
  const [type, setType] = useState<"buy"|"sell">("buy");
  const [marginUsd, setMarginUsd] = useState("100");
  const [lev, setLev] = useState<number>(1);
  const [busy, setBusy] = useState(false);

  async function place() {
    setBusy(true);
    try {
      const margin = Math.round((parseFloat(marginUsd||"0")||0) * 100);
      await api.createTrade({ asset, type, margin, leverage: lev });
      setMarginUsd("100");
      alert("Order placed");
    } catch (e:any) { alert(e?.message || "Order failed"); }
    finally { setBusy(false); }
  }

  return (
    <div className="h-full flex flex-col p-3 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <div className="opacity-70">{asset}/USDT</div>
        <div className="font-semibold">
          {p ? priceStr(type==="buy"?p.buyPrice:p.sellPrice, p.decimals) : "—"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button className={`px-3 py-2 rounded-xl ${type==="buy"?"bg-emerald-600":"bg-neutral-800 border border-neutral-700"}`}
          onClick={()=>setType("buy")}>Buy</button>
        <button className={`px-3 py-2 rounded-xl ${type==="sell"?"bg-rose-600":"bg-neutral-800 border border-neutral-700"}`}
          onClick={()=>setType("sell")}>Sell</button>
      </div>

      <div>
        <div className="opacity-70 mb-1 text-sm">Margin (USD)</div>
        <input value={marginUsd} onChange={e=>setMarginUsd(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700" />
      </div>

      <div>
        <div className="opacity-70 mb-1 text-sm">Leverage</div>
        <select value={lev} onChange={e=>setLev(parseInt(e.target.value))}
          className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700">
          {LEV.map(x => <option key={x} value={x}>{x}x</option>)}
        </select>
      </div>

      <button disabled={busy}
        className={`mt-auto w-full py-2 rounded-xl ${type==="buy"?"bg-emerald-600":"bg-rose-600"}`}
        onClick={place}>
        {busy ? "Submitting..." : (type==="buy" ? "Buy" : "Sell")}
      </button>
    </div>
  );
}
