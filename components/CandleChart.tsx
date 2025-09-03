"use client";
import { useEffect, useRef, useState } from "react";
import {
  createChart, IChartApi, ISeriesApi,
  CandlestickData, UTCTimestamp
} from "lightweight-charts";
import { api } from "@/lib/api";

export default function CandleChart({ asset }: { asset: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const chart = createChart(el, {
      height: 360,
      width: el.clientWidth,
      layout: { background: { color: "transparent" }, textColor: "#ddd" },
      grid: { vertLines: { color: "#222" }, horzLines: { color: "#222" } },
      crosshair: { mode: 0 },
    }) as IChartApi;
    chartRef.current = chart;
    seriesRef.current = chart.addCandlestickSeries();

    const ro = new ResizeObserver(() => {
      const e2 = mountRef.current, ch = chartRef.current;
      if (!e2 || !ch) return;
      ch.applyOptions({ width: e2.clientWidth });
    });
    ro.observe(el);

    return () => {
      try { ro.unobserve(el); ro.disconnect(); } catch {}
      try { chart.remove(); } catch {}
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    api.candles(asset, "1m")
      .then(({ candles }) => {
        if (!alive || !seriesRef.current) return;
        const data: CandlestickData[] = candles.map((c: any) => ({
          time: (Math.floor(c.timestamp / 1000) as unknown) as UTCTimestamp,
          open:  c.open  / 10 ** c.decimal,
          high:  c.high  / 10 ** c.decimal,
          low:   c.low   / 10 ** c.decimal,
          close: c.close / 10 ** c.decimal,
        }));
        seriesRef.current.setData(data);
      })
      .finally(() => alive && setLoading(false));

    return () => { alive = false; };
  }, [asset]);

  return (
    <div className="card p-4">
      <div className="text-sm mb-2 opacity-80">{asset} — 1m Candles</div>
      <div ref={mountRef} className="w-full" />
      {loading && <div className="text-xs opacity-60 mt-2">loading…</div>}
    </div>
  );
}
