"use client";

import { useMemo, useState } from "react";
import { usePrices } from "@/store/prices";
import { priceStr } from "@/lib/format";

type Props = {
  /** Symbols you want to show, e.g. ["BTC","ETH","SOL"] */
  symbols: string[];
  /** Currently selected symbol, will highlight the row */
  focus?: string;
  /** Called when a row is clicked */
  onPick?: (symbol: string) => void;
};

export default function InstrumentList({ symbols, focus, onPick }: Props) {
  const [q, setQ] = useState("");
  const map = usePrices((s) => s.map); // { BTC: {buyPrice, sellPrice, decimals}, ... }

  // simple client-side filter
  const filtered = useMemo(
    () => symbols.filter((s) => s.toLowerCase().includes(q.toLowerCase())),
    [symbols, q]
  );

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="border-b border-neutral-800 p-3">
        <input
          placeholder="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2"
        />
      </div>

      <div className="border-b border-neutral-800 px-3 py-2 text-xs uppercase opacity-60">
        Instruments
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <table className="w-full border-collapse border-spacing-0 text-sm">
          <thead className="sticky top-0 bg-neutral-900 text-xs opacity-60">
            <tr>
              <th className="px-3 py-2 text-left">Symbol</th>
              <th className="px-3 py-2 text-right">Bid</th>
              <th className="px-3 py-2 text-right">Ask</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sym) => {
              const p = map[sym]; // might be undefined until first WS tick
              const rowIsActive = sym === focus;
              const clickable = typeof onPick === "function";

              return (
                <tr
                  key={sym}
                  onClick={() => clickable && onPick!(sym)}
                  className={[
                    "border-b border-neutral-800",
                    clickable ? "cursor-pointer hover:bg-neutral-800" : "",
                    rowIsActive ? "bg-neutral-800" : "",
                  ].join(" ")}
                >
                  <td className="px-3 py-2 font-medium">{sym}</td>
                  <td className="px-3 py-2 text-right">
                    {p ? priceStr(p.sellPrice, p.decimals) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {p ? priceStr(p.buyPrice, p.decimals) : "—"}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center opacity-60" colSpan={3}>
                  No instruments
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
