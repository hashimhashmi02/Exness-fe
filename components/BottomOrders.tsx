"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { priceStr, dollars } from "@/lib/format";

export default function BottomOrders() {
  const [open, setOpen] = useState<any[]>([]);
  const [closed, setClosed] = useState<any[]>([]);

  const load = () => {
    api.openTrades().then(r => setOpen(r.trades));
    api.closedTrades().then(r => setClosed(r.trades));
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-neutral-800 flex gap-2 text-sm">
        <div className="font-medium">Orders</div>
        <button onClick={load} className="ml-auto px-3 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700">Refresh</button>
      </div>

      <div className="p-3 overflow-auto text-sm">
        <div className="mb-2 opacity-70">Open</div>
        <table className="w-full mb-4">
          <thead className="text-xs opacity-60">
            <tr><th className="text-left">Type</th><th>Lev</th><th>Open</th><th>Margin</th><th></th></tr>
          </thead>
          <tbody>
            {open.map(r => (
              <tr key={r.orderId} className="border-t border-neutral-800">
                <td className="py-2">{r.type}</td>
                <td className="text-center">{r.leverage}x</td>
                <td className="text-center">{priceStr(r.openPrice,4)}</td>
                <td className="text-center">${dollars(r.margin)}</td>
                <td className="text-right">
                  <button className="px-3 py-1 rounded-lg bg-neutral-800 border border-neutral-700"
                    onClick={() => api.closeTrade(r.orderId).then(load)}>Close</button>
                </td>
              </tr>
            ))}
            {!open.length && <tr><td className="py-4 text-center opacity-60" colSpan={5}>No open orders</td></tr>}
          </tbody>
        </table>

        <div className="mb-2 opacity-70">Closed</div>
        <table className="w-full">
          <thead className="text-xs opacity-60">
            <tr><th className="text-left">Type</th><th>Lev</th><th>Open</th><th>Close</th><th>PnL</th></tr>
          </thead>
          <tbody>
            {closed.map(r => (
              <tr key={r.orderId} className="border-t border-neutral-800">
                <td className="py-2">{r.type}</td>
                <td className="text-center">{r.leverage}x</td>
                <td className="text-center">{priceStr(r.openPrice,4)}</td>
                <td className="text-center">{priceStr(r.closePrice,4)}</td>
                <td className={`text-center ${r.pnl>=0?"text-emerald-400":"text-rose-400"}`}>${dollars(r.pnl)}</td>
              </tr>
            ))}
            {!closed.length && <tr><td className="py-4 text-center opacity-60" colSpan={5}>No history yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
