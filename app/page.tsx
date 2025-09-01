"use client";
import { useState } from "react";
import PriceTiles from "@/components/PriceTiles";
import CandleChart from "@/components/CandleChart";
import OrderTicket from "@/components/OrderTicket";

const SYMBOLS = ["BTC", "ETH", "SOL"];

export default function Page() {
  const [focus, setFocus] = useState("BTC");
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <PriceTiles symbols={SYMBOLS} />
      </div>
      <div className="flex gap-2">
        {SYMBOLS.map(s => (
          <button key={s} className={`btn ${focus===s?"bg-blue-600 border-blue-700":""}`} onClick={()=>setFocus(s)}>{s}</button>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <CandleChart asset={focus}/>
        </div>
        <OrderTicket asset={focus}/>
      </div>
    </div>
  );
}
