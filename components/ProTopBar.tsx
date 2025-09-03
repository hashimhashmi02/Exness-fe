"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { dollars } from "@/lib/format";
import { usePrices } from "@/store/prices";
import { TrendingUp, TrendingDown, Settings, Bell } from "lucide-react";

interface ImprovedProTopBarProps {
  symbols: string[];
  focus: string;
  setFocus: (s: string) => void;
  timeframe: string;
  setTimeframe: (tf: string) => void;
}

export default function ImprovedProTopBar({
  symbols, focus, setFocus, timeframe, setTimeframe
}: ImprovedProTopBarProps) {
  const [balance, setBalance] = useState<string>("—");
  const [equity, setEquity] = useState<string>("—");
  const [pnl, setPnl] = useState<number>(0);
  const map = usePrices(s => s.map);

  useEffect(() => {
    api.balance()
      .then(r => {
        setBalance(`$${dollars(r.usd_balance)}`);
        setEquity(`$${dollars(r.usd_balance + 2350)}`); // Mock equity calculation
        setPnl(234.56); // Mock P&L
      })
      .catch(() => {
        setBalance("—");
        setEquity("—");
      });
  }, []);

  const timeframes = ["1m", "5m", "15m", "30m", "1h", "4h", "1d"];

  return (
    <header className="h-16 border-b border-neutral-800/50 bg-gradient-to-r from-[#0a0a0b] to-[#111113] backdrop-blur-sm flex items-center px-4 gap-4">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="text-yellow-400 font-black text-xl tracking-wide">exness</div>
        <div className="h-6 w-px bg-neutral-700"></div>
      </div>

      {/* Symbol Tabs */}
      <nav className="flex items-center gap-1 flex-1 overflow-x-auto">
        {symbols.map(symbol => {
          const priceInfo = map[symbol];
          const price = priceInfo ? (priceInfo.buyPrice / Math.pow(10, priceInfo.decimals)) : 0;
          const isActive = focus === symbol;
          const change = Math.random() * 2 - 1; // Mock price change
          
          return (
            <button
              key={symbol}
              onClick={() => setFocus(symbol)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all whitespace-nowrap ${
                isActive 
                  ? "border-blue-500 bg-blue-500/10 text-white" 
                  : "border-neutral-700/50 hover:bg-neutral-800/50 text-gray-300 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-1">
                {change >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}
                <span className="font-medium">{symbol}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono">
                  {price > 0 ? price.toFixed(priceInfo?.decimals || 2) : "—"}
                </div>
                <div className={`text-xs ${change >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Account Info */}
      <div className="flex items-center gap-4">
        {/* P&L Display */}
        <div className="flex items-center gap-3 px-3 py-2 bg-neutral-900/50 rounded-lg border border-neutral-800/50">
          <div className="text-center">
            <div className="text-xs text-gray-400">P&L</div>
            <div className={`text-sm font-medium ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
              {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
            </div>
          </div>
          <div className="h-8 w-px bg-neutral-700"></div>
          <div className="text-center">
            <div className="text-xs text-gray-400">Balance</div>
            <div className="text-sm font-medium text-white">{balance}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">Equity</div>
            <div className="text-sm font-medium text-white">{equity}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-gray-400 hover:text-white transition-all">
            <Bell className="w-4 h-4" />
          </button>
          <button className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-gray-400 hover:text-white transition-all">
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Account Indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">Demo</span>
        </div>
      </div>
    </header>
  );
}