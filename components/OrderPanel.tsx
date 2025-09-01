"use client";
import { useState } from "react";
import { usePrices } from "@/store/prices";
import { priceStr } from "@/lib/format";
import { api } from "@/lib/api";

const LEV = [1,5,10,20,100] as const;

export default function OrderPanel({ asset }: { asset: string }) {
  const p = usePrices(s => s.map[asset]);
  const [tab, setTab] = useState<"market"|"pending">("market");
  const [type, setType] = useState<"buy"|"sell">("buy");
  const [marginUsd, setMarginUsd] = useState("100");
  const [lev, setLev] = useState<number>(1);
  const [tp, setTp] = useState<string>("");
  const [sl, setSl] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function place() {
    setBusy(true);
    try {
      const margin = Math.round((parseFloat(marginUsd||"0")||0) * 100);
      await api.createTrade({ asset, type, margin, leverage: lev });
      setMarginUsd("100"); setTp(""); setSl("");
      alert("Order placed");
    } catch (e:any) {
      alert(e?.message || "Order failed");
    } finally { setBusy(false); }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-neutral-800 flex gap-2 text-sm">
        <button onClick={()=>setTab("market")}
          className={`px-3 py-1.5 rounded-xl ${tab==="market" ? "bg-blue-600 border-blue-700" : "bg-neutral-800 border border-neutral-700"}`}>
          Market
        </button>
        <button onClick={()=>setTab("pending")}
          className={`px-3 py-1.5 rounded-xl ${tab==="pending" ? "bg-blue-600 border-blue-700" : "bg-neutral-800 border border-neutral-700"}`}>
          Pending
        </button>
      </div>

      <div className="p-3 space-y-3 text-sm">
        <div className="flex items-center justify-between">
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
          <div className="opacity-70 mb-1">Margin (USD)</div>
          <input value={marginUsd} onChange={e=>setMarginUsd(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700" />
        </div>

        <div>
          <div className="opacity-70 mb-1">Leverage</div>
          <select value={lev} onChange={e=>setLev(parseInt(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700">
            {LEV.map(x => <option key={x} value={x}>{x}x</option>)}
          </select>
        </div>


        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="opacity-70 mb-1">Take Profit</div>
            <input value={tp} onChange={e=>setTp(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700" placeholder="price" />
          </div>
          <div>
            <div className="opacity-70 mb-1">Stop Loss</div>
            <input value={sl} onChange={e=>setSl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700" placeholder="price" />
          </div>
        </div>

        <button disabled={busy}
          className={`w-full py-2 rounded-xl ${type==="buy"?"bg-emerald-600":"bg-rose-600"}`}
          onClick={place}>
          {busy ? "Submitting..." : (type==="buy" ? "Buy" : "Sell")}
        </button>
      </div>
    </div>
  );
}
