import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ExternalLink,
  Gauge,
  Info,
  Layers3,
  LineChart,
  Loader2,
  LockKeyhole,
  Medal,
  Plus,
  RadioTower,
  RefreshCcw,
  ShieldCheck,
  SlidersHorizontal,
  Trophy,
  Wallet,
  XCircle
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { coingeckoIds, competitors, initialMarkets, seededErEvents, seededTrades } from "./marketData";
import {
  formatCompact,
  formatCountdown,
  formatCurrency,
  formatPercent,
  formatPrice,
  formatSigned,
  formatTime,
  shortAddress
} from "./format";
import {
  calculateLiquidationEstimate,
  calculatePositionPnl,
  DEMO_STARTING_BALANCE,
  evolveFallbackMarkets,
  makeErEvent,
  mergeLivePrices,
  randomId
} from "./sim";
import type { Competitor, ErEvent, FeedStatus, Market, OrderType, PendingOrder, Position, Side, TradeEvent, WalletState } from "./types";

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect?: () => Promise<void>;
    };
  }
}

const roundLengthSeconds = 8 * 60 + 42;
const rpcEndpoint = import.meta.env.VITE_MAGICBLOCK_RPC_URL || "https://api.devnet.solana.com";
const priceRefreshMs = 6500;

const initialPositions: Position[] = [
  {
    id: "seed-position",
    marketId: "BTCUSDT",
    side: "long",
    margin: 1000,
    leverage: 10,
    size: 10000,
    entryPrice: 66012.8,
    openedAt: Date.now() - 1000 * 55
  }
];

function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const stored = window.localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Persistence should never block the arena demo.
    }
  }, [key, value]);

  return [value, setValue] as const;
}

function App() {
  const [markets, setMarkets] = useState<Market[]>(initialMarkets);
  const [activeMarketId, setActiveMarketId] = usePersistentState("flash-arena:active-market", "BTCUSDT");
  const [positions, setPositions] = usePersistentState<Position[]>("flash-arena:positions", initialPositions);
  const [pendingOrders, setPendingOrders] = usePersistentState<PendingOrder[]>("flash-arena:pending-orders", []);
  const [recentTrades, setRecentTrades] = usePersistentState<TradeEvent[]>("flash-arena:recent-trades", seededTrades);
  const [erEvents, setErEvents] = usePersistentState<ErEvent[]>("flash-arena:er-events", seededErEvents);
  const [wallet, setWallet] = useState<WalletState>({ status: "disconnected" });
  const [feedStatus, setFeedStatus] = useState<FeedStatus>("loading");
  const [feedProvider, setFeedProvider] = useState("Live market feed");
  const [roundSeconds, setRoundSeconds] = useState(roundLengthSeconds);
  const [side, setSide] = useState<Side>("long");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [margin, setMargin] = useState(1000);
  const [leverage, setLeverage] = useState(10);
  const [triggerPrice, setTriggerPrice] = useState(66300);
  const [realizedPnl, setRealizedPnl] = usePersistentState("flash-arena:realized-pnl", 0);
  const [mobileTab, setMobileTab] = useState<"trade" | "positions" | "leaderboard" | "activity">("trade");
  const [toast, setToast] = useState<string | null>(null);
  const [erLatency, setErLatency] = useState<number | null>(18);
  const tickRef = useRef(0);
  const lastLiveAt = useRef(0);

  const activeMarket = markets.find((market) => market.id === activeMarketId) ?? markets[0];
  const usedMargin = positions.reduce((total, position) => total + position.margin, 0);
  const unrealizedPnl = positions.reduce((total, position) => {
    const market = markets.find((item) => item.id === position.marketId);
    return total + (market ? calculatePositionPnl(position, market.price) : 0);
  }, 0);
  const availableBalance = DEMO_STARTING_BALANCE + realizedPnl - usedMargin;
  const equity = DEMO_STARTING_BALANCE + realizedPnl + unrealizedPnl;
  const pnlPercent = ((equity - DEMO_STARTING_BALANCE) / DEMO_STARTING_BALANCE) * 100;
  const roundStatus = roundSeconds > 25 ? "live" : roundSeconds > 0 ? "settling" : "settled";
  const canTrade = roundStatus === "live";

  const leaderboard = useMemo(() => {
    const user: Competitor = {
      id: "you",
      name: wallet.status === "connected" ? `You (${shortAddress(wallet.address)})` : "You (Demo)",
      equity,
      pnl: equity - DEMO_STARTING_BALANCE,
      openPositions: positions.length,
      accent: "#a3ff12"
    };
    return [...competitors, user].sort((first, second) => second.equity - first.equity);
  }, [equity, positions.length, wallet.address, wallet.status]);

  const userRank = leaderboard.findIndex((item) => item.id === "you") + 1;

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRoundSeconds((seconds) => {
        if (seconds <= 0) return roundLengthSeconds;
        return seconds - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      tickRef.current += 1;
      if (Date.now() - lastLiveAt.current > priceRefreshMs * 2) {
        setFeedStatus((status) => (status === "loading" ? "fallback" : status === "live" ? "stale" : "fallback"));
        setFeedProvider("Fallback simulator");
        setMarkets((current) => evolveFallbackMarkets(current, tickRef.current));
      }
    }, 2200);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadPrices = async () => {
      try {
        const ids = Object.values(coingeckoIds).join(",");
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`, {
          cache: "no-store"
        });
        if (!response.ok) throw new Error(`Price feed ${response.status}`);
        const payload = (await response.json()) as Record<string, { usd?: number; usd_24h_change?: number }>;
        const prices: Record<string, number> = {};
        const changes: Record<string, number> = {};
        Object.entries(coingeckoIds).forEach(([marketId, geckoId]) => {
          const item = payload[geckoId];
          if (item?.usd) prices[marketId] = item.usd;
          if (typeof item?.usd_24h_change === "number") changes[marketId] = item.usd_24h_change;
        });
        if (Object.keys(prices).length === 0) throw new Error("Empty price payload");
        if (!cancelled) {
          lastLiveAt.current = Date.now();
          setFeedStatus("live");
          setFeedProvider("CoinGecko live feed");
          setMarkets((current) => mergeLivePrices(current, prices, changes));
        }
      } catch {
        if (!cancelled) {
          setFeedStatus("fallback");
          setFeedProvider("Fallback simulator");
        }
      }
    };

    loadPrices();
    const interval = window.setInterval(loadPrices, priceRefreshMs);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const pingEr = async () => {
      const started = performance.now();
      try {
        const response = await fetch(rpcEndpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: "flash-arena-health", method: "getSlot" })
        });
        if (!response.ok) throw new Error("RPC unavailable");
        await response.json();
        if (!cancelled) {
          setErLatency(Math.round(performance.now() - started));
        }
      } catch {
        if (!cancelled) {
          setErLatency(null);
          setErEvents((current) => [
            makeErEvent("ER Health Check", "RPC delayed, local state active", "delayed"),
            ...current.slice(0, 7)
          ]);
        }
      }
    };

    pingEr();
    const interval = window.setInterval(pingEr, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!pendingOrders.length) return;

    const triggered: PendingOrder[] = [];
    const remaining = pendingOrders.filter((order) => {
      const market = markets.find((item) => item.id === order.marketId);
      if (!market) return true;
      const shouldTrigger =
        order.orderType === "limit"
          ? order.side === "long"
            ? market.price <= order.triggerPrice
            : market.price >= order.triggerPrice
          : order.side === "long"
            ? market.price >= order.triggerPrice
            : market.price <= order.triggerPrice;
      if (shouldTrigger) triggered.push(order);
      return !shouldTrigger;
    });

    if (!triggered.length) return;

    setPendingOrders(remaining);
    triggered.forEach((order) => openPosition(order.side, order.margin, order.leverage, order.marketId, "triggered"));
  }, [markets]);

  const pushToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2800);
  };

  const connectWallet = async () => {
    if (!window.solana) {
      setWallet({ status: "unavailable", error: "No Solana wallet found" });
      pushToast("No Solana wallet found. Demo mode remains available.");
      return;
    }

    try {
      setWallet({ status: "connecting" });
      const result = await window.solana.connect();
      setWallet({ status: "connected", address: result.publicKey.toString() });
      setErEvents((current) => [makeErEvent("Wallet Joined Arena", "Identity linked to round", "synced"), ...current.slice(0, 7)]);
    } catch {
      setWallet({ status: "error", error: "Wallet connection rejected" });
      pushToast("Wallet connection was rejected.");
    }
  };

  const disconnectWallet = async () => {
    await window.solana?.disconnect?.();
    setWallet({ status: "disconnected" });
  };

  const openPosition = (
    selectedSide = side,
    selectedMargin = margin,
    selectedLeverage = leverage,
    selectedMarketId = activeMarketId,
    type: TradeEvent["type"] = "open"
  ) => {
    const market = markets.find((item) => item.id === selectedMarketId);
    if (!market || !canTrade) {
      pushToast("Round is not accepting new trades.");
      return;
    }

    if (selectedMargin <= 0 || selectedMargin > availableBalance) {
      pushToast("Insufficient demo USDC for this order.");
      return;
    }

    const size = selectedMargin * selectedLeverage;
    const position: Position = {
      id: randomId("pos"),
      marketId: selectedMarketId,
      side: selectedSide,
      margin: selectedMargin,
      leverage: selectedLeverage,
      size,
      entryPrice: market.price,
      openedAt: Date.now()
    };

    setPositions((current) => [position, ...current]);
    setRecentTrades((current) => [
      {
        id: randomId("trade"),
        time: Date.now(),
        trader: wallet.status === "connected" ? shortAddress(wallet.address) : "You",
        side: selectedSide,
        marketId: selectedMarketId,
        size,
        price: market.price,
        type
      },
      ...current.slice(0, 9)
    ]);
    setErEvents((current) => [
      makeErEvent(type === "triggered" ? "Order Triggered" : "Trade Accepted", `${selectedSide.toUpperCase()} ${market.symbol}`, "pending"),
      ...current.slice(0, 7)
    ]);
    window.setTimeout(() => {
      setErEvents((current) =>
        current.map((event, index) => (index === 0 && event.status === "pending" ? { ...event, status: "synced" } : event))
      );
    }, 1200);
  };

  const placeOrder = () => {
    if (orderType === "market") {
      openPosition();
      return;
    }

    if (margin <= 0 || margin > availableBalance) {
      pushToast("Insufficient demo USDC for this order.");
      return;
    }

    const order: PendingOrder = {
      id: randomId("order"),
      marketId: activeMarketId,
      side,
      orderType,
      triggerPrice,
      margin,
      leverage,
      createdAt: Date.now()
    };
    setPendingOrders((current) => [order, ...current]);
    setErEvents((current) => [
      makeErEvent("Conditional Order Queued", `${orderType.toUpperCase()} ${activeMarket.symbol} @ ${formatPrice(triggerPrice)}`, "pending"),
      ...current.slice(0, 7)
    ]);
    pushToast(`${orderType.toUpperCase()} order queued in the arena.`);
  };

  const closePosition = (position: Position) => {
    const market = markets.find((item) => item.id === position.marketId);
    if (!market) return;
    const pnl = calculatePositionPnl(position, market.price);
    setRealizedPnl((value) => value + pnl);
    setPositions((current) => current.filter((item) => item.id !== position.id));
    setRecentTrades((current) => [
      {
        id: randomId("trade"),
        time: Date.now(),
        trader: wallet.status === "connected" ? shortAddress(wallet.address) : "You",
        side: position.side,
        marketId: position.marketId,
        size: position.size,
        price: market.price,
        pnl,
        type: "close"
      },
      ...current.slice(0, 9)
    ]);
    setErEvents((current) => [makeErEvent("Trade Settled", `PnL ${formatSigned(pnl)}`, "pending"), ...current.slice(0, 7)]);
  };

  const resetRound = () => {
    setRoundSeconds(roundLengthSeconds);
    setPositions(initialPositions);
    setPendingOrders([]);
    setRealizedPnl(0);
    setRecentTrades(seededTrades);
    setErEvents([makeErEvent("Round Reset", "New demo round initialized", "synced"), ...seededErEvents]);
  };

  return (
    <main className="app-shell">
      <TopBar
        wallet={wallet}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
        roundSeconds={roundSeconds}
        feedStatus={feedStatus}
        feedProvider={feedProvider}
        erLatency={erLatency}
      />

      <section className="dashboard-grid">
        <aside className="left-rail">
          <ArenaRooms roundSeconds={roundSeconds} onReset={resetRound} />
          <MarketList markets={markets} activeMarketId={activeMarketId} onSelect={setActiveMarketId} />
        </aside>

        <section className="center-stage">
          <RoundStage
            market={activeMarket}
            roundSeconds={roundSeconds}
            equity={equity}
            pnl={equity - DEMO_STARTING_BALANCE}
            pnlPercent={pnlPercent}
            rank={userRank}
            onMarketChange={setActiveMarketId}
            markets={markets}
          />
          <PriceChart market={activeMarket} />
          <div className="mobile-tabs" role="tablist" aria-label="Arena sections">
            {(["trade", "positions", "leaderboard", "activity"] as const).map((tab) => (
              <button key={tab} className={mobileTab === tab ? "active" : ""} onClick={() => setMobileTab(tab)}>
                {tab}
              </button>
            ))}
          </div>
        </section>

        <aside className={`right-rail mobile-panel ${mobileTab === "trade" ? "show" : ""}`}>
          <TradeTicket
            activeMarket={activeMarket}
            markets={markets}
            activeMarketId={activeMarketId}
            onMarketChange={setActiveMarketId}
            side={side}
            onSideChange={setSide}
            orderType={orderType}
            onOrderTypeChange={setOrderType}
            margin={margin}
            onMarginChange={setMargin}
            leverage={leverage}
            onLeverageChange={setLeverage}
            triggerPrice={triggerPrice}
            onTriggerPriceChange={setTriggerPrice}
            availableBalance={availableBalance}
            canTrade={canTrade}
            onPlaceOrder={placeOrder}
          />
        </aside>
      </section>

      <section className="lower-grid">
        <div className={`mobile-panel ${mobileTab === "positions" ? "show" : ""}`}>
          <PositionsPanel positions={positions} markets={markets} onClose={closePosition} />
        </div>
        <div className={`mobile-panel ${mobileTab === "leaderboard" ? "show" : ""}`}>
          <Leaderboard items={leaderboard} />
        </div>
        <div className={`mobile-panel ${mobileTab === "activity" ? "show" : ""}`}>
          <RecentTrades trades={recentTrades} markets={markets} />
        </div>
        <ErLog events={erEvents} />
      </section>

      <StatusFooter
        availableBalance={availableBalance}
        throughput={12842}
        erLatency={erLatency}
        feedStatus={feedStatus}
        erRoot={erEvents[0]?.root ?? "9xF3...7b1c"}
      />

      {toast ? <div className="toast">{toast}</div> : null}
    </main>
  );
}

function TopBar({
  wallet,
  onConnect,
  onDisconnect,
  roundSeconds,
  feedStatus,
  feedProvider,
  erLatency
}: {
  wallet: WalletState;
  onConnect: () => void;
  onDisconnect: () => void;
  roundSeconds: number;
  feedStatus: FeedStatus;
  feedProvider: string;
  erLatency: number | null;
}) {
  return (
    <header className="top-bar">
      <div className="brand">
        <div className="brand-mark">F</div>
        <span>Flash Arena</span>
      </div>
      <div className="round-pill">
        <span>Round 12</span>
        <b>Live</b>
      </div>
      <div className="countdown-box" aria-label="Round countdown">
        <span>Round ends in</span>
        <strong>{formatCountdown(roundSeconds)}</strong>
      </div>
      <StatusItem icon={<RadioTower size={16} />} label="Price source" value={feedProvider} status={feedStatus} />
      <StatusItem
        icon={<Gauge size={16} />}
        label="ER latency"
        value={erLatency === null ? "Delayed" : `${erLatency} ms`}
        status={erLatency === null ? "stale" : "live"}
      />
      <StatusItem icon={<Layers3 size={16} />} label="MagicBlock ER" value="Ephemeral Rollup" status="live" />
      <button
        className={`wallet-button ${wallet.status === "connected" ? "connected" : ""}`}
        onClick={wallet.status === "connected" ? onDisconnect : onConnect}
      >
        {wallet.status === "connecting" ? <Loader2 size={16} className="spin" /> : <Wallet size={16} />}
        {wallet.status === "connected" ? shortAddress(wallet.address) : wallet.status === "unavailable" ? "Demo Mode" : "Connect Wallet"}
        <ChevronDown size={14} />
      </button>
    </header>
  );
}

function StatusItem({ icon, label, value, status }: { icon: ReactNode; label: string; value: string; status: FeedStatus | "live" | "stale" }) {
  return (
    <div className="status-item">
      <span className="status-icon">{icon}</span>
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
      <i className={`dot ${status}`} />
    </div>
  );
}

function ArenaRooms({ roundSeconds, onReset }: { roundSeconds: number; onReset: () => void }) {
  return (
    <section className="panel arena-rooms">
      <div className="panel-title">
        <span>Arena Rooms</span>
        <button className="icon-button" onClick={onReset} title="Reset demo round">
          <Plus size={16} />
        </button>
      </div>
      <RoomRow title="Round 12" meta="Started 14:12:30" status="Live" time={formatCountdown(roundSeconds)} active />
      <RoomRow title="Round 11" meta="Settling in 01:17" status="Settling" />
      <RoomRow title="Round 13" meta="Starts in 10:42" status="Next" />
    </section>
  );
}

function RoomRow({ title, meta, status, time, active }: { title: string; meta: string; status: string; time?: string; active?: boolean }) {
  return (
    <div className={`room-row ${active ? "active" : ""}`}>
      <div>
        <strong>{title}</strong>
        <small>{meta}</small>
      </div>
      <span className={`room-status ${status.toLowerCase()}`}>{status}</span>
      {time ? <b>{time}</b> : null}
    </div>
  );
}

function MarketList({
  markets,
  activeMarketId,
  onSelect
}: {
  markets: Market[];
  activeMarketId: string;
  onSelect: (marketId: string) => void;
}) {
  return (
    <section className="panel market-list">
      <div className="panel-title">
        <span>Markets</span>
        <button className="text-button">
          All <ChevronDown size={14} />
        </button>
      </div>
      {markets.map((market) => (
        <button
          key={market.id}
          className={`market-row ${activeMarketId === market.id ? "selected" : ""}`}
          onClick={() => onSelect(market.id)}
          style={{ "--market-accent": market.accent } as CSSProperties}
        >
          <span className="market-token">{market.venue.slice(0, 1)}</span>
          <span className="market-main">
            <strong>{market.symbol}</strong>
            <small>${formatPrice(market.price)}</small>
          </span>
          <span className="market-side">
            <b className={market.change24h >= 0 ? "positive" : "negative"}>{formatPercent(market.change24h)}</b>
            <i>{market.volume}</i>
          </span>
          <span className={`mini-badge ${market.status}`}>{market.status}</span>
        </button>
      ))}
      <button className="market-rules">
        Market info & rules <ExternalLink size={13} />
      </button>
    </section>
  );
}

function RoundStage({
  market,
  markets,
  onMarketChange,
  roundSeconds,
  equity,
  pnl,
  pnlPercent,
  rank
}: {
  market: Market;
  markets: Market[];
  onMarketChange: (marketId: string) => void;
  roundSeconds: number;
  equity: number;
  pnl: number;
  pnlPercent: number;
  rank: number;
}) {
  return (
    <section className="panel round-stage">
      <div className="round-heading">
        <div>
          <h1>Round 12 <span>Live</span></h1>
          <p>Trade. Compete. Climb.</p>
        </div>
        <label className="market-select">
          <span>Active market</span>
          <select value={market.id} onChange={(event) => onMarketChange(event.target.value)}>
            {markets.map((item) => (
              <option key={item.id} value={item.id}>
                {item.symbol}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="metrics-row">
        <Metric label="Equity (Demo USDC)" value={formatCurrency(equity)} sub="10,000.00 start" />
        <Metric label="PnL (Demo USDC)" value={formatSigned(pnl)} sub={formatPercent(pnlPercent)} tone={pnl >= 0 ? "positive" : "negative"} />
        <Metric label="Current rank" value={String(rank)} sub={`Top ${(rank / 1248 * 100).toFixed(2)}%`} />
        <div className="round-timer-card">
          <Clock3 size={18} />
          <span>Ends in</span>
          <strong>{formatCountdown(roundSeconds)}</strong>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "positive" | "negative" }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
      <small className={tone}>{sub}</small>
    </div>
  );
}

function PriceChart({ market }: { market: Market }) {
  const candles = market.candles;
  const lows = candles.map((candle) => candle.low);
  const highs = candles.map((candle) => candle.high);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const width = 820;
  const height = 270;
  const pad = 18;
  const scaleY = (price: number) => height - pad - ((price - min) / (max - min || 1)) * (height - pad * 2);
  const candleWidth = width / candles.length - 4;
  const line = candles
    .map((candle, index) => `${(index / (candles.length - 1)) * width},${scaleY(candle.close)}`)
    .join(" ");

  return (
    <section className="panel chart-panel">
      <div className="chart-toolbar">
        <div className="toolbar-tabs">
          {["1m", "5m", "15m", "1h", "4h", "1D"].map((tab) => (
            <button key={tab} className={tab === "15m" ? "selected" : ""}>
              {tab}
            </button>
          ))}
        </div>
        <div className="chart-mode">
          <button className="selected">
            <BarChart3 size={14} /> Candles
          </button>
          <button>
            <LineChart size={14} /> Line
          </button>
        </div>
        <div className="chart-price">
          <span>{market.symbol} · 15 · Pyth-ready</span>
          <strong className={market.price >= market.previousPrice ? "positive" : "negative"}>${formatPrice(market.price)}</strong>
          <small>{formatPercent(market.change24h)}</small>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="price-chart" role="img" aria-label={`${market.symbol} price chart`}>
        <defs>
          <linearGradient id="lineGlow" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#a3ff12" stopOpacity="0.75" />
          </linearGradient>
        </defs>
        {Array.from({ length: 8 }).map((_, index) => (
          <line key={`h-${index}`} x1="0" x2={width} y1={(height / 8) * index} y2={(height / 8) * index} className="grid-line" />
        ))}
        {Array.from({ length: 9 }).map((_, index) => (
          <line key={`v-${index}`} x1={(width / 8) * index} x2={(width / 8) * index} y1="0" y2={height} className="grid-line" />
        ))}
        <polyline points={line} fill="none" stroke="url(#lineGlow)" strokeWidth="2.1" />
        {candles.map((candle, index) => {
          const x = (index / candles.length) * width + 2;
          const open = scaleY(candle.open);
          const close = scaleY(candle.close);
          const high = scaleY(candle.high);
          const low = scaleY(candle.low);
          const up = candle.close >= candle.open;
          return (
            <g key={`${market.id}-${index}`}>
              <line x1={x + candleWidth / 2} x2={x + candleWidth / 2} y1={high} y2={low} className={up ? "candle-up" : "candle-down"} />
              <rect
                x={x}
                y={Math.min(open, close)}
                width={Math.max(1.8, candleWidth)}
                height={Math.max(2, Math.abs(close - open))}
                rx="1"
                className={up ? "candle-up" : "candle-down"}
              />
            </g>
          );
        })}
      </svg>
      <div className="chart-stats">
        <Stat label="24h Change" value={formatPercent(market.change24h)} tone={market.change24h >= 0 ? "positive" : "negative"} />
        <Stat label="24h High" value={formatPrice(max)} />
        <Stat label="24h Low" value={formatPrice(min)} />
        <Stat label="24h Volume" value={market.volume} />
        <Stat label="Funding / 8h" value="0.0100%" tone="positive" />
        <Stat label="Open Interest" value="$1.38B" />
      </div>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) {
  return (
    <div className="chart-stat">
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
    </div>
  );
}

function TradeTicket({
  activeMarket,
  markets,
  activeMarketId,
  onMarketChange,
  side,
  onSideChange,
  orderType,
  onOrderTypeChange,
  margin,
  onMarginChange,
  leverage,
  onLeverageChange,
  triggerPrice,
  onTriggerPriceChange,
  availableBalance,
  canTrade,
  onPlaceOrder
}: {
  activeMarket: Market;
  markets: Market[];
  activeMarketId: string;
  onMarketChange: (marketId: string) => void;
  side: Side;
  onSideChange: (side: Side) => void;
  orderType: OrderType;
  onOrderTypeChange: (type: OrderType) => void;
  margin: number;
  onMarginChange: (value: number) => void;
  leverage: number;
  onLeverageChange: (value: number) => void;
  triggerPrice: number;
  onTriggerPriceChange: (value: number) => void;
  availableBalance: number;
  canTrade: boolean;
  onPlaceOrder: () => void;
}) {
  const size = margin * leverage;
  const liquidation = calculateLiquidationEstimate(side, activeMarket.price, leverage);

  return (
    <section className="panel trade-ticket">
      <div className="panel-title">
        <span>Place Trade</span>
        <SlidersHorizontal size={17} />
      </div>
      <div className="side-switch">
        <button className={side === "long" ? "long active" : "long"} onClick={() => onSideChange("long")}>
          Long <ArrowUpRight size={17} />
        </button>
        <button className={side === "short" ? "short active" : "short"} onClick={() => onSideChange("short")}>
          Short <ArrowDownRight size={17} />
        </button>
      </div>
      <div className="order-tabs">
        {(["market", "limit", "stop"] as const).map((type) => (
          <button key={type} className={orderType === type ? "selected" : ""} onClick={() => onOrderTypeChange(type)}>
            {type}
          </button>
        ))}
      </div>
      <label className="field">
        <span>Market</span>
        <select value={activeMarketId} onChange={(event) => onMarketChange(event.target.value)}>
          {markets.map((market) => (
            <option key={market.id} value={market.id}>
              {market.symbol}
            </option>
          ))}
        </select>
      </label>
      <label className="field amount-field">
        <span>Amount (Demo USDC)</span>
        <div className="amount-input">
          <button onClick={() => onMarginChange(Math.max(50, margin - 250))}>-</button>
          <input value={margin} onChange={(event) => onMarginChange(Number(event.target.value) || 0)} inputMode="numeric" />
          <button onClick={() => onMarginChange(Math.min(availableBalance, margin + 250))}>+</button>
        </div>
      </label>
      <div className="quick-sizes">
        {[0.25, 0.5, 0.75, 1].map((share) => (
          <button key={share} onClick={() => onMarginChange(Math.max(50, Math.floor(availableBalance * share)))}>
            {share === 1 ? "Max" : `${share * 100}%`}
          </button>
        ))}
      </div>
      {orderType !== "market" ? (
        <label className="field">
          <span>{orderType === "limit" ? "Limit price" : "Stop trigger"}</span>
          <input value={triggerPrice} onChange={(event) => onTriggerPriceChange(Number(event.target.value) || activeMarket.price)} />
        </label>
      ) : null}
      <label className="leverage-field">
        <span>
          Leverage <Info size={14} />
        </span>
        <strong>{leverage}x</strong>
        <input
          type="range"
          min="1"
          max="50"
          step="1"
          value={leverage}
          onChange={(event) => onLeverageChange(Number(event.target.value))}
        />
        <div className="leverage-labels">
          <span>1x</span>
          <span>5x</span>
          <span>10x</span>
          <span>25x</span>
          <span>50x</span>
        </div>
      </label>
      <div className="risk-box">
        <InfoLine label="Position size" value={`${formatCurrency(size)} USDC`} />
        <InfoLine label="Required margin" value={`${formatCurrency(margin)} USDC`} />
        <InfoLine label="Liq. price (est.)" value={formatPrice(liquidation)} />
        <InfoLine label="Est. fees" value={`${formatCurrency(size * 0.00012)} USDC`} />
      </div>
      <button className={`place-button ${side}`} disabled={!canTrade || margin <= 0 || margin > availableBalance} onClick={onPlaceOrder}>
        {orderType === "market" ? `${side} ${formatCurrency(margin, 0)} USDC` : `Queue ${orderType} ${side}`}
        <small>{leverage}x on {activeMarket.symbol}</small>
      </button>
      <div className="safety-note">
        <ShieldCheck size={16} />
        <span>No real funds required. All balances are simulated for this arena round.</span>
      </div>
    </section>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PositionsPanel({ positions, markets, onClose }: { positions: Position[]; markets: Market[]; onClose: (position: Position) => void }) {
  return (
    <section className="panel positions-panel">
      <div className="panel-title">
        <span>Open Positions</span>
        <span>{positions.length}</span>
      </div>
      <div className="table compact-table">
        <div className="table-head position-grid">
          <span>Market</span>
          <span>Side</span>
          <span>Size</span>
          <span>Entry</span>
          <span>PnL</span>
          <span />
        </div>
        {positions.length === 0 ? (
          <div className="empty-state">
            <LockKeyhole size={18} />
            <span>No open positions. Place a demo trade to enter the leaderboard.</span>
          </div>
        ) : (
          positions.map((position) => {
            const market = markets.find((item) => item.id === position.marketId)!;
            const pnl = calculatePositionPnl(position, market.price);
            return (
              <div className="table-row position-grid" key={position.id}>
                <strong>{market.symbol}</strong>
                <span className={`side-badge ${position.side}`}>{position.side}</span>
                <span>{formatCurrency(position.size, 0)}</span>
                <span>{formatPrice(position.entryPrice)}</span>
                <b className={pnl >= 0 ? "positive" : "negative"}>{formatSigned(pnl)}</b>
                <button className="close-button" onClick={() => onClose(position)}>
                  Close
                </button>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function Leaderboard({ items }: { items: Competitor[] }) {
  const top = items.slice(0, 3);
  return (
    <section className="panel leaderboard">
      <div className="panel-title">
        <span>Leaderboard</span>
        <button className="text-button">
          Full leaderboard <ExternalLink size={13} />
        </button>
      </div>
      <div className="podium">
        {top.map((item, index) => (
          <div key={item.id} className={`podium-player rank-${index + 1}`}>
            <Medal size={18} />
            <strong>{index + 1}</strong>
            <span className="avatar-ring" style={{ "--avatar-accent": item.accent } as CSSProperties}>
              {item.name.slice(0, 2)}
            </span>
            <b>{item.name}</b>
            <small>{formatCurrency(item.equity)}</small>
            <em className={item.pnl >= 0 ? "positive" : "negative"}>{formatPercent((item.pnl / DEMO_STARTING_BALANCE) * 100)}</em>
          </div>
        ))}
      </div>
      <div className="table leaderboard-table">
        <div className="table-head leader-grid">
          <span>Rank</span>
          <span>Trader</span>
          <span>Equity</span>
          <span>PnL</span>
          <span>Open</span>
        </div>
        {items.slice(0, 7).map((item, index) => (
          <div key={item.id} className={`table-row leader-grid ${item.id === "you" ? "you-row" : ""}`}>
            <span>{index + 1}</span>
            <strong>{item.name}</strong>
            <span>{formatCurrency(item.equity)}</span>
            <b className={item.pnl >= 0 ? "positive" : "negative"}>{formatSigned(item.pnl)}</b>
            <span>{item.openPositions}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecentTrades({ trades, markets }: { trades: TradeEvent[]; markets: Market[] }) {
  return (
    <section className="panel recent-trades">
      <div className="panel-title">
        <span>Recent Trades</span>
        <div className="mini-toggle">
          <button className="selected">All</button>
          <button>My trades</button>
        </div>
      </div>
      <div className="table">
        <div className="table-head trades-grid">
          <span>Time</span>
          <span>Trader</span>
          <span>Side</span>
          <span>Market</span>
          <span>Size</span>
          <span>Price</span>
        </div>
        {trades.slice(0, 8).map((trade) => {
          const market = markets.find((item) => item.id === trade.marketId);
          return (
            <div className="table-row trades-grid" key={trade.id}>
              <span>{formatTime(trade.time)}</span>
              <strong>{trade.trader}</strong>
              <span className={`side-badge ${trade.side}`}>{trade.side}</span>
              <span>{market?.symbol ?? trade.marketId}</span>
              <span>{formatCompact(trade.size)}</span>
              <span>{formatPrice(trade.price)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ErLog({ events }: { events: ErEvent[] }) {
  return (
    <section className="panel er-log">
      <div className="panel-title">
        <span>ER Settlement Log</span>
        <button className="text-button">View all</button>
      </div>
      <div className="table">
        <div className="table-head er-grid">
          <span>Time</span>
          <span>Event</span>
          <span>Details</span>
          <span>Status</span>
        </div>
        {events.slice(0, 8).map((event) => (
          <div className="table-row er-grid" key={event.id}>
            <span>{formatTime(event.time)}</span>
            <strong>{event.event}</strong>
            <span>{event.details}</span>
            <b className={`er-status ${event.status}`}>
              {event.status === "failed" ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
              {event.status}
            </b>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatusFooter({
  availableBalance,
  throughput,
  erLatency,
  feedStatus,
  erRoot
}: {
  availableBalance: number;
  throughput: number;
  erLatency: number | null;
  feedStatus: FeedStatus;
  erRoot: string;
}) {
  return (
    <footer className="status-footer">
      <div>
        <Activity size={15} />
        <span>USDC (Demo)</span>
        <strong>{formatCurrency(availableBalance)}</strong>
      </div>
      <div>
        <RefreshCcw size={15} />
        <span>Buying Power</span>
        <strong>{formatCurrency(Math.max(0, availableBalance))}</strong>
      </div>
      <div>
        <Gauge size={15} />
        <span>Throughput</span>
        <strong>{formatCurrency(throughput, 0)} TPS</strong>
      </div>
      <div>
        <Layers3 size={15} />
        <span>State Root</span>
        <strong>{erRoot}</strong>
      </div>
      <div>
        <RadioTower size={15} />
        <span>{feedStatus === "live" ? "Live prices" : "Fallback active"}</span>
        <strong>{erLatency === null ? "ER delayed" : `Finality ~${Math.max(120, erLatency + 230)}ms`}</strong>
      </div>
    </footer>
  );
}

export default App;
