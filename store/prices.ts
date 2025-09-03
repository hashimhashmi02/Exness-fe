"use client";
import { create } from "zustand";
type Px = { symbol:string; buyPrice:number; sellPrice:number; decimals:number };
type State = { map: Record<string,Px>; set:(arr:Px[])=>void };
export const usePrices = create<State>((set)=>({
  map: {},
  set: (arr) => set(s => {
    const m = {...s.map};
    arr.forEach(p => m[p.symbol] = p);
    return { map: m };
  })
}));
