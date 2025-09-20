"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  UTCTimestamp,
  LogicalRange,
  MouseEventParams,
} from "lightweight-charts";
import { api } from "@/lib/api";
import { connectPrices } from "@/lib/ws";

type Interval = "1m" | "5m" | "1h";
const SEC: Record<Interval, number> = { "1m": 60, "5m": 300, "1h": 3600 };

export default function CandleChart({ asset }: { asset: string }) {
  const [interval, setInterval_] = useState<Interval>("1m");
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<{ price?: number; time?: number }>({});

  const mountRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const lastBarRef = useRef<CandlestickData | null>(null);
  const decimalsRef = useRef<number>(4);

  // create chart once
  useEffect(() => {
    const el = mountRef.current!;
    const chart = createChart(el, {
      height: 600,
      width: el.clientWidth,
      layout: { background: { color: "transparent" }, textColor: "#ddd" },
      grid: { vertLines: { color: "#222" }, horzLines: { color: "#222" } },
      rightPriceScale: { borderVisible: false, scaleMargins: { top: 0.02, bottom: 0.02 } },
      timeScale: { rightOffset: 0, barSpacing: 8, fixLeftEdge: true, rightBarStaysOnScroll: true, timeVisible: true },
      handleScroll: { pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: true },
      handleScale: { mouseWheel: false, pinch: true, axisPressedMouseMove: true },
    });
    chartRef.current = chart;

    const s = chart.addCandlestickSeries({
      upColor: "#22c55e", downColor: "#ef4444",
      wickUpColor: "#22c55e", wickDownColor: "#ef4444", borderVisible: false,
    });
    seriesRef.current = s;

    chart.subscribeCrosshairMove((p: MouseEventParams) => {
      if (!p || !p.time) { setCursor({}); return; }
      const val = (p.seriesData?.get(s) as any) ?? null;
      const price = typeof val === "number" ? val : val?.close;
      setCursor({ price: price != null ? Number(price) : undefined, time: (p.time as number) * 1000 });
    });

    const ro = new ResizeObserver(() => {
      const el2 = mountRef.current;
      if (el2 && chartRef.current) chartRef.current.applyOptions({ width: el2.clientWidth });
    });
    ro.observe(el);

    const wheel = (ev: WheelEvent) => {
      const ch = chartRef.current; if (!ch) return;
      ev.preventDefault();
      const ts = ch.timeScale();
      const r = ts.getVisibleLogicalRange() as LogicalRange | null; if (!r) return;

      const rect = el.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const at = ts.coordinateToLogical(x);
      const center = typeof at === "number" && Number.isFinite(at) ? at : (r.from + r.to) / 2;

      const MIN_SPAN = 20, MAX_SPAN = 6000;
      const factor = ev.deltaY < 0 ? 0.8 : 1.25;
      let span = (r.to - r.from) * factor;
      span = Math.min(MAX_SPAN, Math.max(MIN_SPAN, span));
      ts.setVisibleLogicalRange({ from: center - span / 2, to: center + span / 2 });
    };
    el.addEventListener("wheel", wheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", wheel);
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // load history
  useEffect(() => {
    let on = true;
    setLoading(true);

    api.candles(asset, interval)
      .then(({ candles }) => {
        if (!on || !seriesRef.current || !chartRef.current) return;
        const data: CandlestickData[] = candles.map((c: any) => {
          const dec = Number(c.decimal ?? c.decimals ?? 4);
          decimalsRef.current = dec;
          return {
            time: (Math.floor(c.timestamp / 1000) as unknown) as UTCTimestamp,
            open:  c.open  / 10 ** dec,
            high:  c.high  / 10 ** dec,
            low:   c.low   / 10 ** dec,
            close: c.close / 10 ** dec,
          };
        });
        seriesRef.current.setData(data);
        lastBarRef.current = data.at(-1) ?? null;
        chartRef.current.timeScale().fitContent();
      })
      .finally(() => on && setLoading(false));

    return () => { on = false; };
  }, [asset, interval]);

  // ws live update
  useEffect(() => {
    const ws = connectPrices([asset], (updates) => {
      const u = updates.find((x: any) => x.symbol === asset);
      if (!u || !seriesRef.current) return;

      const dec = Number(u.decimals ?? decimalsRef.current ?? 4);
      decimalsRef.current = dec;
      const price = u.buyPrice / 10 ** dec;

      const bucket = (Math.floor(Date.now() / 1000 / SEC[interval]) * SEC[interval]) as UTCTimestamp;
      const last = lastBarRef.current;

      if (!last || Number(last.time) < bucket) {
        const bar: CandlestickData = { time: bucket, open: price, high: price, low: price, close: price };
        seriesRef.current.update(bar);
        lastBarRef.current = bar;
      } else {
        const bar: CandlestickData = {
          time: bucket,
          open: last.open,
          high: Math.max(last.high, price),
          low: Math.min(last.low, price),
          close: price,
        };
        seriesRef.current.update(bar);
        lastBarRef.current = bar;
      }
    });
    return () => ws.close();
  }, [asset, interval]);

  const zoomIn  = () => doZoom(0.75);
  const zoomOut = () => doZoom(1.25);
  const fit     = () => chartRef.current?.timeScale().fitContent();
  const last    = () => chartRef.current?.timeScale().scrollToRealTime();

  function doZoom(mult: number) {
    const ts = chartRef.current?.timeScale(); if (!ts) return;
    const r = ts.getVisibleLogicalRange() as LogicalRange | null; if (!r) return;
    const center = (r.from + r.to) / 2;
    const MIN_SPAN = 20, MAX_SPAN = 6000;
    let span = (r.to - r.from) * mult;
    span = Math.min(MAX_SPAN, Math.max(MIN_SPAN, span));
    ts.setVisibleLogicalRange({ from: center - span / 2, to: center + span / 2 });
  }

  const timeStr =
    cursor.time != null
      ? new Date(cursor.time).toLocaleString(undefined, {
          hour12: false, hour: "2-digit", minute: "2-digit",
          second: interval === "1m" ? "2-digit" : undefined,
        })
      : "—";
  const priceStr =
    cursor.price != null ? cursor.price.toFixed(Math.min(6, Math.max(2, decimalsRef.current))) : "—";

  return (
    <div className="card p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-sm opacity-75">{asset}/USDT • {interval}</div>
        <div className="flex items-center gap-2">
          {(["1m","5m","1h"] as Interval[]).map(i => (
            <button key={i}
              onClick={() => { setInterval_(i); setCursor({}); }}
              className={`px-3 py-1.5 rounded-xl border ${i===interval ? "bg-blue-600 border-blue-700" : "bg-neutral-800 border-neutral-700"}`}>
              {i}
            </button>
          ))}
          <button className="btn px-3" onClick={zoomOut}>−</button>
          <button className="btn px-3" onClick={zoomIn}>+</button>
          <button className="btn px-3" onClick={fit}>Fit</button>
          <button className="btn px-3" onClick={last}>Last</button>
        </div>
      </div>

      <div className="mb-2 text-xs opacity-70">
        <span className="mr-4">Time: {timeStr}</span>
        <span>Price: {priceStr}</span>
      </div>

      <div ref={mountRef} className="w-full h-[600px] rounded-xl overflow-hidden" />
      {loading && <div className="mt-2 text-xs opacity-60">loading…</div>}
    </div>
  );
}
