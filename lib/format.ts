export const dollars = (cents:number) => (cents/100).toFixed(2);
export const priceStr = (int:number, decimals:number) =>
  (int / Math.pow(10, decimals)).toFixed(decimals);
