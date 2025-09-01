"use client";
import { useEffect, useMemo, useState } from "react";
import { connectPrices } from "@/lib/ws";
import { usePrices } from "@/store/prices";
import { priceStr } from "@/lib/format";

export default function InstrumentList({
  symbols, focus, onPick
}: { symbols: string[]; focus: string; onPick: (s:string)=>void }) {
  const [q, setQ] = useState("");
  const map = usePrices(s=>s.map);
  const set = usePrices(s=>s.set);

  useEffect(() => {
    const ws = connectPrices(symbols, set);
    return () => ws.close();
  }, [symbols, set]);

  const filtered = useMemo(
    () => symbols.filter(s => s.toLowerCase().includes(q.toLowerCase())),
    [symbols, q]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-neutral-800">
        <input
          placeholder="Search"
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700"
        />
      </div>
      <div className="text-xs uppercase opacity-60 px-3 py-2 border-b border-neutral-800">Instruments</div>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-xs opacity-60 sticky top-0 bg-neutral-900">
            <tr>
              <th className="text-left px-3 py-2">Symbol</th>
              <th className="text-right px-3 py-2">Bid</th>
              <th className="text-right px-3 py-2">Ask</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(sym => {
              const p = map[sym];
              return (
                <tr key={sym}
                  onClick={()=>onPick(sym)}
                  className={`cursor-pointer hover:bg-neutral-800 ${focus===sym ? "bg-neutral-800" : ""}`}>
                  <td className="px-3 py-2 font-medium">{sym}</td>
                  <td className="px-3 py-2 text-right">{p ? priceStr(p.sellPrice, p.decimals) : "—"}</td>
                  <td className="px-3 py-2 text-right">{p ? priceStr(p.buyPrice, p.decimals) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
