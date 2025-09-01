"use client";
import { useEffect } from "react";
import { connectPrices } from "@/lib/ws";
import { usePrices } from "@/store/prices";
import { priceStr } from "@/lib/format";

export default function PriceTiles({ symbols }: { symbols: string[] }) {
  const map = usePrices((s) => s.map);
  const set = usePrices((s) => s.set);

  useEffect(() => {
    const ws = connectPrices(symbols, set);
    return () => ws.close();
  }, [symbols, set]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {symbols.map((sym) => {
        const p = map[sym];
        return (
          <div key={sym} className="card p-4">
            <div className="text-xs opacity-70">{sym}</div>
            <div className="text-xl font-semibold">
              {p ? priceStr(p.buyPrice, p.decimals) : "—"}
            </div>
            <div className="text-xs opacity-60">sell: {p ? priceStr(p.sellPrice, p.decimals) : "—"}</div>
          </div>
        );
      })}
    </div>
  );
}
