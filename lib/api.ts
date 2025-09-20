// exness-fe/lib/api.ts
export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function authHeader(): Record<string, string> {
  const t =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const hdrs = new Headers(init.headers as HeadersInit);
  if (!hdrs.has("Content-Type")) hdrs.set("Content-Type", "application/json");
  for (const [k, v] of Object.entries(authHeader())) hdrs.set(k, v);

  const res = await fetch(`${API}${path}`, { ...init, headers: hdrs, cache: "no-store" });
  const txt = await res.text();

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { msg = JSON.parse(txt)?.message ?? txt ?? msg; } catch { msg = txt || msg; }
    throw new Error(msg);
  }
  try { return JSON.parse(txt) as T; } catch { return {} as T; }
}

/* ---------------- Public API ---------------- */

type Interval = "1m" | "5m" | "1h";

export const api = {
  signup: (b: { email: string; password: string }) =>
    req<{ userId: string }>("/api/v1/user/signup", { method: "POST", body: JSON.stringify(b) }),

  signin: (b: { email: string; password: string }) =>
    req<{ token: string }>("/api/v1/user/signin", { method: "POST", body: JSON.stringify(b) }),

  /** Raw balance endpoints (shape differs across BE versions) */
  balanceV1: () => req<{ usd_balance: number }>("/api/v1/me/balance"),
  balanceLegacy: () => req<{ balance: { usd: { qty: number } } }>("/balance"),

  /** Easy helper: ALWAYS returns a number (USD) regardless of BE version */
  async getUsdBalance(): Promise<number> {
    try {
      const r = await this.balanceV1();
      return r.usd_balance;
    } catch {
      const r = await this.balanceLegacy();
      return r.balance.usd.qty;
    }
  },

  assets: () => req<{ assets: any[] }>("/api/v1/assets"),

  candles: async (asset: string, ts: Interval) => {
    try {
      return await req<{ candles: any[] }>(
        `/api/v1/candles?asset=${encodeURIComponent(asset)}&ts=${ts}`
      );
    } catch (e) {
      if (ts === "1m") throw e;
      const base = await req<{ candles: any[] }>(
        `/api/v1/candles?asset=${encodeURIComponent(asset)}&ts=1m`
      );
      const SEC = ts === "5m" ? 300 : 3600;
      const grouped: Record<number, any> = {};
      for (const c of base.candles) {
        const tsec = Math.floor(c.timestamp / 1000);
        const bucket = Math.floor(tsec / SEC) * SEC;
        const key = bucket * 1000;
        const dec = c.decimal ?? c.decimals ?? 4;
        const { open, high, low, close } = c;
        const g = grouped[key];
        if (!g) grouped[key] = { timestamp: key, decimal: dec, open, high, low, close };
        else { g.high = Math.max(g.high, high); g.low = Math.min(g.low, low); g.close = close; }
      }
      return { candles: Object.values(grouped).sort((a: any, b: any) => a.timestamp - b.timestamp) };
    }
  },

  createTrade: (b: {
    asset: string;
    type: "buy" | "sell";
    margin: number;
    leverage: number;
    stopLoss?: number;
    takeProfit?: number;
  }) => req<{ orderId: string }>("/api/v1/trade", { method: "POST", body: JSON.stringify(b) }),

  /** NEW: manual close */
  closeTrade: (orderId: string) =>
    req<{ ok: boolean; orderId: string }>("/api/v1/trade/close", {
      method: "POST",
      body: JSON.stringify({ orderId }),
    }),

  openTrades: () => req<{ trades: any[] }>("/api/v1/trades/open"),
  closedTrades: () => req<{ trades: any[] }>("/api/v1/trades"),
};
