"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { priceStr, dollars } from "@/lib/format";

export default function HistoryTable() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.closedTrades().then(r => setRows(r.trades)); }, []);
  return (
    <div className="card p-4">
      <div className="mb-2 text-sm opacity-80">History</div>
      <div className="space-y-2">
        {rows.map(r => (
          <div key={r.orderId} className="flex items-center gap-3 text-sm opacity-90">
            <span className="w-16">{r.type}</span>
            <span className="w-20">{r.leverage}x</span>
            <span className="w-40">open: {priceStr(r.openPrice, 4)}</span>
            <span className="w-40">close: {priceStr(r.closePrice, 4)}</span>
            <span className="w-32">PnL: ${dollars(r.pnl)}</span>
          </div>
        ))}
        {!rows.length && <div className="text-xs opacity-60">No trades yet</div>}
      </div>
    </div>
  );
}
