"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { dollars } from "@/lib/format";
import { usePrices } from "@/store/prices";

export default function ProTopBar({
  symbols, focus, setFocus
}: { symbols: string[]; focus: string; setFocus: (s:string)=>void }) {
  const [bal, setBal] = useState<string>("—");
  const map = usePrices(s => s.map);

  useEffect(() => {
    api.balance().then(r => setBal(`$${dollars(r.usd_balance)}`)).catch(()=>setBal("—"));
  }, []);

  return (
    <header className="h-14 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur flex items-center px-3 gap-2">
      <div className="text-yellow-400 font-black tracking-wide mr-2">exness</div>
      <nav className="flex items-center gap-2 flex-1 overflow-x-auto">
        {symbols.map(s => {
          const p = map[s];
          const val = p ? (p.buyPrice/10**p.decimals).toFixed(p.decimals) : "—";
          const active = focus === s;
          return (
            <button
              key={s}
              onClick={()=>setFocus(s)}
              className={`px-3 py-1.5 rounded-full border text-sm whitespace-nowrap
                ${active ? "border-blue-600 bg-blue-600/20" : "border-neutral-700 hover:bg-neutral-800"}`}>
              {s} <span className="opacity-70 ml-1">{val}</span>
            </button>
          );
        })}
      </nav>
      <div className="text-sm opacity-80">Balance: {bal}</div>
    </header>
  );
}
