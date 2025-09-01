"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { priceStr } from "@/lib/format";

export default function OpenOrders() {
  const [rows, setRows] = useState<any[]>([]);
  const load = () => api.openTrades().then(r => setRows(r.trades));
  useEffect(() => { load(); }, []);

  async function close(id: string) {
    await api.closeTrade(id);
    load();
  }

  return (
    <div className="card p-4">
      <div className="mb-2 text-sm opacity-80">Open Orders</div>
      <div className="space-y-2">
        {rows.map(r => (
          <div key={r.orderId} className="flex items-center gap-3 text-sm">
            <span className="w-16">{r.type}</span>
            <span className="w-20">{r.leverage}x</span>
            <span className="w-40">open: {priceStr(r.openPrice, 4)}</span>
            <span className="w-32">margin: ${(r.margin/100).toFixed(2)}</span>
            <button className="btn ml-auto" onClick={() => close(r.orderId)}>Close</button>
          </div>
        ))}
        {!rows.length && <div className="text-xs opacity-60">No open orders</div>}
      </div>
    </div>
  );
}
