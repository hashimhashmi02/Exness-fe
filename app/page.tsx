"use client";
import { useEffect, useState } from "react";
import InstrumentList from "@/components/InstrumentList";
import CandleChart from "@/components/CandleChart";
import OrderPanel from "@/components/OrderPanel";
import BottomOrders from "@/components/BottomOrders";
import { connectPrices } from "@/lib/ws";
import { usePrices } from "@/store/prices";

const SYMBOLS = ["BTC","ETH","SOL"]; // extend as backend supports more

export default function Home() {
  const [asset, setAsset] = useState("BTC");
  const set = usePrices(s=>s.set);

  // global price stream to keep tiles/list fresh
  useEffect(() => {
    const ws = connectPrices(SYMBOLS, set);
    return () => ws.close();
  }, [set]);

  return (
    <div className="grid grid-cols-[320px_1fr_360px] grid-rows-[1fr_260px] gap-3 p-3 h-full">
      {/* instruments */}
      <div className="card overflow-hidden row-span-2">
        <InstrumentList symbols={SYMBOLS} focus={asset} onPick={setAsset} />
      </div>

      {/* chart */}
      <div className="card p-0 overflow-hidden">
        <div className="px-3 py-2 border-b border-neutral-800 text-sm opacity-80">
          {asset}/USDT • 1m
        </div>
        <div className="p-3">
          <CandleChart asset={asset} />
        </div>
      </div>

      {/* order panel */}
      <div className="card">
        <OrderPanel asset={asset} />
      </div>

      {/* bottom orders */}
      <div className="card col-span-2">
        <BottomOrders />
      </div>
    </div>
  );
}
