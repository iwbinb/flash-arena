export type Side = "long" | "short";
export type RoundStatus = "waiting" | "live" | "settling" | "settled";
export type FeedStatus = "loading" | "live" | "stale" | "fallback";
export type ErStatus = "synced" | "pending" | "delayed" | "failed";
export type OrderType = "market" | "limit" | "stop";

export interface Market {
  id: string;
  symbol: string;
  name: string;
  venue: string;
  price: number;
  previousPrice: number;
  change24h: number;
  volume: string;
  status: "live" | "next";
  accent: string;
  spark: number[];
  candles: Candle[];
}

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Position {
  id: string;
  marketId: string;
  side: Side;
  margin: number;
  leverage: number;
  size: number;
  entryPrice: number;
  openedAt: number;
}

export interface PendingOrder {
  id: string;
  marketId: string;
  side: Side;
  orderType: Exclude<OrderType, "market">;
  triggerPrice: number;
  margin: number;
  leverage: number;
  createdAt: number;
}

export interface TradeEvent {
  id: string;
  time: number;
  trader: string;
  side: Side;
  marketId: string;
  size: number;
  price: number;
  pnl?: number;
  type: "open" | "close" | "triggered";
}

export interface ErEvent {
  id: string;
  time: number;
  event: string;
  details: string;
  status: ErStatus;
  root: string;
}

export interface Competitor {
  id: string;
  name: string;
  equity: number;
  pnl: number;
  openPositions: number;
  accent: string;
}

export interface WalletState {
  status: "disconnected" | "connecting" | "connected" | "unavailable" | "error";
  address?: string;
  error?: string;
}

