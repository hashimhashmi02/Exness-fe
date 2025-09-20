"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function BalanceCard() {
  const [usd, setUsd] = useState<number | null>(null);

  useEffect(() => {
    let on = true;
    api.getUsdBalance()
      .then(v => on && setUsd(v))
      .catch(err => on && console.error("balance error:", err));
    return () => { on = false; };
  }, []);

  return (
    <div className="card p-3">
      <div className="text-sm opacity-70">Balance</div>
      <div className="text-2xl font-semibold mt-1">
        {usd == null ? "—" : `$${usd.toFixed(2)}`}
      </div>
    </div>
  );
}
