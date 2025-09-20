"use client";
import { useEffect, useRef, useState } from "react";
import InstrumentList from "@/components/InstrumentList";
import CandleChart from "@/components/CandleChart";
import OrderPanel from "@/components/OrderPanel";
import BottomOrders from "@/components/BottomOrders";
import { connectPrices } from "@/lib/ws";
import { usePrices } from "@/store/prices";

const SYMBOLS = ["BTC", "ETH", "SOL"];

export default function Home() {
  const [asset, setAsset] = useState("BTC");

  
  const [left, setLeft] = useState(340);
  const [bottom, setBottom] = useState(200);
  const wrapRef = useRef<HTMLDivElement>(null);

 
  const set = usePrices((s) => s.set);
  useEffect(() => {
    const ws = connectPrices(SYMBOLS, set);
    return () => ws.close();
  }, [set]);

  // drag handlers
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    let dragging: "left" | "bottom" | null = null;

    const onMove = (e: MouseEvent) => {
      if (!dragging) return;
      const r = wrap.getBoundingClientRect();
      if (dragging === "left") {
        const x = Math.min(Math.max(e.clientX - r.left, 220), r.width - 380);
        setLeft(Math.round(x));
      } else if (dragging === "bottom") {
        const y = Math.min(Math.max(r.bottom - e.clientY, 160), r.height - 220);
        setBottom(Math.round(y));
      }
    };
    const up = () => (dragging = null);

    const leftHandle = wrap.querySelector<HTMLDivElement>("[data-left-handle]");
    const bottomHandle = wrap.querySelector<HTMLDivElement>("[data-bottom-handle]");

    const downLeft = () => (dragging = "left");
    const downBottom = () => (dragging = "bottom");

    leftHandle?.addEventListener("mousedown", downLeft);
    bottomHandle?.addEventListener("mousedown", downBottom);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", up);

    return () => {
      leftHandle?.removeEventListener("mousedown", downLeft);
      bottomHandle?.removeEventListener("mousedown", downBottom);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative h-full p-3"
      style={{
        display: "grid",
        gridTemplateColumns: `${left}px 1fr 360px`,
        gridTemplateRows: `1fr ${bottom}px`,
        gap: "12px",
      }}
    >
      {/* left instruments */}
      <div className="card overflow-hidden row-span-2">
        <InstrumentList symbols={SYMBOLS} focus={asset} onPick={setAsset} />
      </div>

      {/* vertical resize handle (between left and middle) */}
      <div
        data-left-handle
        className="absolute top-3 bottom-3"
        style={{ left: `${left + 3}px`, width: 6, cursor: "col-resize" }}
      />

      {/* chart center */}
      <div className="card p-0 overflow-hidden">
        <div className="px-3 py-2 border-b border-neutral-800 text-sm opacity-80">
          {asset}/USDT
        </div>
        <div className="p-3">
          <CandleChart asset={asset} />
        </div>
      </div>

      {/* right order panel */}
      <div className="card">
        <OrderPanel asset={asset} />
      </div>

      {/* bottom resize handle (top of bottom row, spans center+right) */}
      <div
        data-bottom-handle
        className="absolute left-[calc(320px+12px)] right-3"
        style={{ top: `calc(100% - ${bottom}px - 3px)`, height: 6, cursor: "row-resize" }}
      />

      {/* bottom orders */}
      <div className="card col-span-2">
        <BottomOrders />
      </div>
    </div>
  );
}
