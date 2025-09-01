"use client";
import { useState } from "react";
import ProTopBar from "@/components/ProTopBar";
import InstrumentList from "@/components/InstrumentList";
import OrderPanel from "@/components/OrderPanel";
import CandleChart from "@/components/CandleChart";
import BottomOrders from "@/components/BottomOrders";

const SYMBOLS = ["BTC","ETH","SOL"]; 

export default function TradePage() {
  const [asset, setAsset] = useState<string>("BTC");
  return (
    <div className="h-[calc(100vh-56px)]"> 
      <ProTopBar focus={asset} setFocus={setAsset} symbols={SYMBOLS} />
      <div className="grid grid-cols-[320px_1fr_360px] grid-rows-[1fr_260px] gap-3 p-3 h-full">

        <div className="card overflow-hidden row-span-2">
          <InstrumentList symbols={SYMBOLS} focus={asset} onPick={setAsset} />
        </div>

      
        <div className="card p-0 overflow-hidden">
          <div className="px-3 py-2 border-b border-neutral-800 text-sm opacity-80">
            {asset}/USDT • 1m
          </div>
          <div className="p-3">
            <CandleChart asset={asset} />
          </div>
        </div>
        <div className="card">
          <OrderPanel asset={asset} />
        </div>

        <div className="card col-span-2">
          <BottomOrders />
        </div>
      </div>
    </div>
  );
}
