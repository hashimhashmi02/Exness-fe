"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

/** Shape we expect back from GET /api/v1/trades/open */
type OpenOrder = {
  orderId: string;
  type: "BUY" | "SELL";
  margin: number;         // integer cents
  leverage: number;
  openPrice: number;      // integer price (scaled by decimals)
  stopLoss: number | null;
  takeProfit: number | null;
  openedAt: string | Date;
  // Optional (if your BE returns it)
  symbol?: string;        // e.g. "BTCUSDT"
  decimals?: number;      // if BE sends it; else we assume 4
};

export default function BottomOrders() {
  const [rows, setRows] = useState<OpenOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.openTrades();
      setRows(res.trades ?? []);
    } catch (e: any) {
      setError(e?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function fmtMoneyCents(cents: number) {
    return `$${(cents / 100).toFixed(2)}`;
  }

  function fmtPrice(intPrice: number, decimals?: number) {
    const dec = Number.isFinite(decimals) ? Number(decimals) : 4;
    return (intPrice / 10 ** dec).toFixed(Math.min(6, Math.max(2, dec)));
  }

  function fmtTime(t: string | Date) {
    const d = typeof t === "string" ? new Date(t) : t;
    if (!d || isNaN(d.getTime())) return "—";
    return d.toLocaleString(undefined, { hour12: false });
  }

  async function closeOne(id: string) {
    setBusyId(id);
    try {
      await api.closeTrade(id);
      await load();
    } catch (e: any) {
      alert(e?.message || "Close failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="card p-3 mt-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm opacity-70">Open Orders</div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 rounded-lg bg-neutral-800 border border-neutral-700"
            onClick={load}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-400 mb-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm opacity-70 py-6">Loading open orders…</div>
      ) : rows.length === 0 ? (
        <div className="text-sm opacity-70 py-6">No open orders.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left opacity-70 border-b border-neutral-800">
              <tr>
                <th className="py-2 pr-2">Order ID</th>
                <th className="py-2 pr-2">Symbol</th>
                <th className="py-2 pr-2">Side</th>
                <th className="py-2 pr-2 text-right">Margin</th>
                <th className="py-2 pr-2 text-right">Leverage</th>
                <th className="py-2 pr-2 text-right">Open Price</th>
                <th className="py-2 pr-2 text-right">Stop Loss</th>
                <th className="py-2 pr-2 text-right">Take Profit</th>
                <th className="py-2 pr-2">Opened</th>
                <th className="py-2 pr-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const dec = (r as any).decimals as number | undefined; // if BE returns it
                const sym = r.symbol ?? "—";
                const shortId = r.orderId.slice(0, 6) + "…" + r.orderId.slice(-4);
                return (
                  <tr key={r.orderId} className="border-b border-neutral-900">
                    <td className="py-2 pr-2">{shortId}</td>
                    <td className="py-2 pr-2">{sym}</td>
                    <td className="py-2 pr-2">
                      <span
                        className={
                          r.type === "BUY"
                            ? "text-emerald-400 font-medium"
                            : "text-rose-400 font-medium"
                        }
                      >
                        {r.type}
                      </span>
                    </td>
                    <td className="py-2 pr-2 text-right">{fmtMoneyCents(r.margin)}</td>
                    <td className="py-2 pr-2 text-right">{r.leverage}x</td>
                    <td className="py-2 pr-2 text-right">
                      {fmtPrice(r.openPrice, dec)}
                    </td>
                    <td className="py-2 pr-2 text-right">
                      {r.stopLoss == null ? "—" : fmtPrice(r.stopLoss, dec)}
                    </td>
                    <td className="py-2 pr-2 text-right">
                      {r.takeProfit == null ? "—" : fmtPrice(r.takeProfit, dec)}
                    </td>
                    <td className="py-2 pr-2">{fmtTime(r.openedAt)}</td>
                    <td className="py-2 pr-2 text-right">
                      <button
                        disabled={busyId === r.orderId}
                        onClick={() => closeOne(r.orderId)}
                        className="px-3 py-1 rounded-lg bg-neutral-800 border border-neutral-700 disabled:opacity-50"
                      >
                        {busyId === r.orderId ? "Closing…" : "Close"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
