import { NextResponse } from "next/server";
export const revalidate = 90;
export async function GET() {
 try {
  const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false", { next: { revalidate: 90 }, headers: { accept: "application/json" } });
  if (!response.ok) throw new Error("Market provider unavailable");
  const coins: unknown = await response.json();
  if (!Array.isArray(coins)) throw new Error("Invalid response");
  return NextResponse.json(coins.slice(0,10).map(c => ({
    symbol: String(c.symbol || "").toUpperCase().slice(0,8),
    price: Number(c.current_price || 0),
    change: Number(c.price_change_percentage_24h || 0)
  })), { headers: { "Cache-Control": "public, s-maxage=90, stale-while-revalidate=120" } });
 } catch {
  return NextResponse.json({error:"Live market temporarily unavailable"}, {status:503});
 }
}
