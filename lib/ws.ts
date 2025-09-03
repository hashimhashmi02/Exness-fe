export function connectPrices(symbols: string[], onMsg:(updates:any[])=>void) {
  const httpUrl = process.env.NEXT_PUBLIC_API_URL!;
  const url = new URL("/ws", httpUrl.replace(/^http/i, "ws"));
  url.searchParams.set("symbols", symbols.join(","));
  const ws = new WebSocket(url.toString());
  ws.onmessage = (e) => {
    try { const { price_updates } = JSON.parse(e.data); if (Array.isArray(price_updates)) onMsg(price_updates); }
    catch {}
  };
  return ws;
}
