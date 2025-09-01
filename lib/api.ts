export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

function authHeader(): Record<string, string> {
  const t =
    typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers as HeadersInit | undefined),
    ...authHeader(),
  };

  const res = await fetch(`${API}${path}`, { ...init, headers, cache: "no-store" });

  if (!res.ok) {
   
    const bodyText = await res.text().catch(() => "");
    let msg = `HTTP ${res.status}`;
    if (bodyText) {
      try {
        const j = JSON.parse(bodyText);
        msg = j?.message ?? bodyText;
      } catch {
        msg = bodyText;
      }
    }
    throw new Error(msg);
  }

 
  return (await res.json()) as T;
}


export const api = {
  signup: (b: { email: string; password: string }) =>
    req<{ userId: string }>("/api/v1/user/signup", {
      method: "POST",
      body: JSON.stringify(b),
    }),
  signin: (b: { email: string; password: string }) =>
    req<{ token: string }>("/api/v1/user/signin", {
      method: "POST",
      body: JSON.stringify(b),
    }),
  balance: () => req<{ usd_balance: number }>("/api/v1/user/balance"),
  assets: () => req<{ assets: any[] }>("/api/v1/assets"),
  candles: (asset: string, ts = "1m") =>
    req<{ candles: any[] }>(`/api/v1/candles?asset=${asset}&ts=${ts}`),
  createTrade: (b: {
    asset: string;
    type: "buy" | "sell";
    margin: number;
    leverage: number;
  }) =>
    req<{ orderId: string }>("/api/v1/trade", {
      method: "POST",
      body: JSON.stringify(b),
    }),
  openTrades: () => req<{ trades: any[] }>("/api/v1/trades/open"),
  closedTrades: () => req<{ trades: any[] }>("/api/v1/trades"),
  closeTrade: (orderId: string) =>
    req("/api/v1/trade/close", {
      method: "POST",
      body: JSON.stringify({ orderId }),
    }),
};
