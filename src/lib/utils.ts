import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD", locale: string = "en-US"): string {
  if (currency === "USD") {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  return `${amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatHours(hours: number): string {
  if (hours < 1) {
    const mins = Math.round(hours * 60);
    return `${mins}m`;
  }
  const fullHours = Math.floor(hours);
  const remainingMins = Math.round((hours - fullHours) * 60);
  if (remainingMins === 0) return `${fullHours}h`;
  return `${fullHours}h ${remainingMins}m`;
}

export function formatMinutes(mins: number): string {
  if (mins < 60) {
    return `${Math.round(mins)} mins`;
  }
  const hrs = Math.floor(mins / 60);
  const remainingMins = Math.round(mins % 60);
  if (remainingMins === 0) return `${hrs} hrs`;
  return `${hrs}h ${remainingMins}m`;
}

/**
 * Resolves an internal application path with Astro's configured base URL.
 * Ensures consistent URLs whether deployed at root or a subpath (e.g. /atlasindex/).
 */
export function getBasePath(path: string = ""): string {
  const rawBase = import.meta.env.BASE_URL || "/";
  const base = rawBase.replace(/\/$/, "");
  if (!path || path === "/" || path === "") {
    return base ? `${base}/` : "/";
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

