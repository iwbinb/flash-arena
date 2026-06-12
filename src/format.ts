export const formatCurrency = (value: number, decimals = 2) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);

export const formatCompact = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2
  }).format(value);

export const formatPrice = (value: number) => {
  if (value >= 1000) return formatCurrency(value, 1);
  if (value >= 1) return formatCurrency(value, 2);
  if (value >= 0.01) return formatCurrency(value, 4);
  return value.toFixed(8);
};

export const formatSigned = (value: number, decimals = 2) => {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${formatCurrency(value, decimals)}`;
};

export const formatPercent = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

export const shortAddress = (address?: string) => {
  if (!address) return "Demo Trader";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const formatTime = (value: number) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(value);

export const formatCountdown = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const remainingSeconds = safe % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

