import type { Candle, ErEvent, Market, Position, Side } from "./types";

export const DEMO_STARTING_BALANCE = 10000;

export const randomId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

export const calculatePositionPnl = (position: Position, currentPrice: number) => {
  const direction = position.side === "long" ? 1 : -1;
  const move = ((currentPrice - position.entryPrice) / position.entryPrice) * direction;
  return position.size * move;
};

export const calculateLiquidationEstimate = (side: Side, entryPrice: number, leverage: number) => {
  const buffer = 1 / Math.max(1, leverage);
  return side === "long" ? entryPrice * (1 - buffer * 0.82) : entryPrice * (1 + buffer * 0.82);
};

export const evolveFallbackMarkets = (markets: Market[], tick: number) =>
  markets.map((market, index) => {
    const wave = Math.sin((tick + index * 11) / 7) * 0.0014;
    const pulse = Math.cos((tick + index * 5) / 13) * 0.0009;
    const factor = 1 + wave + pulse;
    const nextPrice = Math.max(0.0000001, market.price * factor);
    const nextCandle = makeNextCandle(market.candles.at(-1)?.close ?? market.price, nextPrice, index);
    return {
      ...market,
      previousPrice: market.price,
      price: nextPrice,
      change24h: market.change24h + wave * 10,
      spark: [...market.spark.slice(1), Math.max(8, Math.min(92, market.spark.at(-1)! + (factor - 1) * 1800))],
      candles: [...market.candles.slice(1), nextCandle]
    };
  });

export const mergeLivePrices = (markets: Market[], prices: Record<string, number>, changes: Record<string, number> = {}) =>
  markets.map((market) => {
    const live = prices[market.id];
    if (!live) return market;
    const nextCandle = makeNextCandle(market.price, live, market.venue.length);
    return {
      ...market,
      previousPrice: market.price,
      price: live,
      change24h: Number.isFinite(changes[market.id]) ? changes[market.id] : ((live - market.previousPrice) / market.previousPrice) * 100,
      spark: [...market.spark.slice(1), Math.max(8, Math.min(92, 50 + ((live - market.previousPrice) / market.previousPrice) * 950))],
      candles: [...market.candles.slice(1), nextCandle]
    };
  });

const makeNextCandle = (previous: number, close: number, offset: number): Candle => {
  const spread = Math.max(Math.abs(close - previous), close * (0.0015 + offset * 0.0001));
  return {
    open: previous,
    close,
    high: Math.max(previous, close) + spread * 0.62,
    low: Math.max(0.0000001, Math.min(previous, close) - spread * 0.58),
    volume: 60 + Math.round(Math.abs(close - previous) * 1000) % 180
  };
};

export const makeErEvent = (event: string, details: string, status: ErEvent["status"] = "pending"): ErEvent => {
  const root = `9xF${Math.random().toString(16).slice(2, 5)}...${Math.random().toString(16).slice(2, 6)}`;
  return {
    id: randomId("er"),
    time: Date.now(),
    event,
    details,
    status,
    root
  };
};
