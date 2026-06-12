import type { Candle, Competitor, ErEvent, Market, TradeEvent } from "./types";

const baseCandles = (start: number, volatility: number): Candle[] => {
  const candles: Candle[] = [];
  let price = start;

  for (let index = 0; index < 72; index += 1) {
    const drift = Math.sin(index / 5) * volatility * 0.22 + Math.cos(index / 9) * volatility * 0.18;
    const open = price;
    const close = Math.max(0.000001, open + drift + (index % 7 - 3) * volatility * 0.035);
    const high = Math.max(open, close) + volatility * (0.16 + (index % 5) * 0.035);
    const low = Math.max(0.000001, Math.min(open, close) - volatility * (0.13 + (index % 6) * 0.03));
    candles.push({ open, high, low, close, volume: 40 + ((index * 13) % 140) });
    price = close;
  }

  return candles;
};

export const initialMarkets: Market[] = [
  {
    id: "BTCUSDT",
    symbol: "BTC-PERP",
    name: "Bitcoin Perpetual",
    venue: "BTC",
    price: 66342.1,
    previousPrice: 65992.2,
    change24h: 1.24,
    volume: "$2.45B",
    status: "live",
    accent: "#f7931a",
    spark: [39, 43, 41, 47, 44, 51, 57, 53, 59, 61, 66, 62],
    candles: baseCandles(64840, 420)
  },
  {
    id: "ETHUSDT",
    symbol: "ETH-PERP",
    name: "Ethereum Perpetual",
    venue: "ETH",
    price: 3312.78,
    previousPrice: 3284.2,
    change24h: 0.85,
    volume: "$1.12B",
    status: "live",
    accent: "#8b9cff",
    spark: [50, 48, 51, 54, 52, 58, 56, 61, 59, 64, 63, 66],
    candles: baseCandles(3245, 34)
  },
  {
    id: "SOLUSDT",
    symbol: "SOL-PERP",
    name: "Solana Perpetual",
    venue: "SOL",
    price: 157.44,
    previousPrice: 153.88,
    change24h: 2.31,
    volume: "$638.7M",
    status: "live",
    accent: "#14f195",
    spark: [26, 29, 35, 33, 39, 44, 41, 47, 51, 58, 55, 62],
    candles: baseCandles(151.8, 2.6)
  },
  {
    id: "JUPUSDT",
    symbol: "JUP-PERP",
    name: "Jupiter Perpetual",
    venue: "JUP",
    price: 0.7128,
    previousPrice: 0.702,
    change24h: 1.54,
    volume: "$92.1M",
    status: "next",
    accent: "#5dd6ff",
    spark: [33, 35, 31, 37, 42, 39, 43, 45, 48, 47, 51, 54],
    candles: baseCandles(0.69, 0.014)
  },
  {
    id: "BONKUSDT",
    symbol: "BONK-PERP",
    name: "Bonk Perpetual",
    venue: "BONK",
    price: 0.00002214,
    previousPrice: 0.00002136,
    change24h: 3.65,
    volume: "$61.5M",
    status: "next",
    accent: "#f6c453",
    spark: [21, 24, 23, 27, 31, 29, 34, 38, 36, 41, 39, 46],
    candles: baseCandles(0.0000208, 0.00000064)
  }
];

export const competitors: Competitor[] = [
  { id: "solana-samurai", name: "SolanaSamurai", equity: 18392.21, pnl: 8392.21, openPositions: 2, accent: "#a3ff12" },
  { id: "arcane-trader", name: "ArcaneTrader", equity: 15827.64, pnl: 5827.64, openPositions: 1, accent: "#22d3ee" },
  { id: "defi-degen", name: "DeFiDegen", equity: 14653.11, pnl: 4653.11, openPositions: 3, accent: "#f6c453" },
  { id: "gamma-glider", name: "GammaGlider", equity: 12120.77, pnl: 2120.77, openPositions: 1, accent: "#8b5cf6" },
  { id: "leverage-lion", name: "LeverageLion", equity: 11789.45, pnl: 1789.45, openPositions: 2, accent: "#27d980" },
  { id: "crypto-ninja", name: "CryptoNinja", equity: 10412.9, pnl: 412.9, openPositions: 0, accent: "#ff5c7a" }
];

export const seededTrades: TradeEvent[] = [
  { id: "t1", time: Date.now() - 11000, trader: "Whale.exe", side: "short", marketId: "BTCUSDT", size: 2500, price: 66341, type: "open" },
  { id: "t2", time: Date.now() - 18000, trader: "SolanaSamurai", side: "long", marketId: "BTCUSDT", size: 1200, price: 66346.5, type: "open" },
  { id: "t3", time: Date.now() - 26000, trader: "ArcaneTrader", side: "long", marketId: "ETHUSDT", size: 850, price: 3311.2, type: "open" },
  { id: "t4", time: Date.now() - 34000, trader: "DeFiDegen", side: "short", marketId: "SOLUSDT", size: 1000, price: 157.2, type: "open" },
  { id: "t5", time: Date.now() - 45000, trader: "GammaGlider", side: "long", marketId: "BTCUSDT", size: 500, price: 66329.9, type: "open" }
];

export const seededErEvents: ErEvent[] = [
  {
    id: "er1",
    time: Date.now() - 12000,
    event: "Trade Settled",
    details: "Tx: 5Hf7...a9e2",
    status: "synced",
    root: "9xF3...7b1c"
  },
  {
    id: "er2",
    time: Date.now() - 22000,
    event: "Batch Committed",
    details: "Batch: #884512",
    status: "synced",
    root: "9xF3...7b1c"
  },
  {
    id: "er3",
    time: Date.now() - 31000,
    event: "State Root Update",
    details: "Root: 9xF3...7b1c",
    status: "synced",
    root: "9xF3...7b1c"
  }
];

export const coingeckoIds: Record<string, string> = {
  BTCUSDT: "bitcoin",
  ETHUSDT: "ethereum",
  SOLUSDT: "solana",
  JUPUSDT: "jupiter-exchange-solana",
  BONKUSDT: "bonk"
};
