import React, { useState, useMemo } from "react";
import { RAW_COUNTRIES } from "@/data/countries";
import { getAllProcessedCountries, calculateCustomWageEffort } from "@/lib/methodology";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatHours, formatMinutes, formatPercent, getBasePath } from "@/lib/utils";
import { Calculator, Clock, ArrowRight, Sparkles, TrendingDown, TrendingUp, Info } from "lucide-react";


export function QuickCalculator() {
  const allCountries = useMemo(() => getAllProcessedCountries(RAW_COUNTRIES), []);
  const [selectedCountryId, setSelectedCountryId] = useState<string>("usa");
  const [customWageInput, setCustomWageInput] = useState<string>("");

  const currentCountry = useMemo(() => {
    return allCountries.find((c) => c.id === selectedCountryId) || allCountries[0];
  }, [allCountries, selectedCountryId]);

  const customWageUSD = parseFloat(customWageInput);
  const isCustomWage = !isNaN(customWageUSD) && customWageUSD > 0;

  const result = useMemo(() => {
    if (isCustomWage) {
      return calculateCustomWageEffort(currentCountry, customWageUSD);
    }
    return {
      basketPercent: currentCountry.basketPercentOfWage,
      laborHours: currentCountry.laborHoursForBasket,
      stressTier: currentCountry.stressTier,
    };
  }, [currentCountry, isCustomWage, customWageUSD]);

  // Key items for quick stats
  const riceItem = currentCountry.items.find((i) => i.itemId === "rice");
  const beefItem = currentCountry.items.find((i) => i.itemId === "beef");
  const eggsItem = currentCountry.items.find((i) => i.itemId === "eggs");
  const chickenItem = currentCountry.items.find((i) => i.itemId === "chicken");

  const tierBadgeVariant = (tier?: string) => {
    switch (tier) {
      case "Low": return "tierLow";
      case "Moderate": return "tierModerate";
      case "High": return "tierHigh";
      default: return "tierSevere";
    }
  };

  return (
    <Card className="border-border/80 bg-card/70 backdrop-blur-md shadow-xl overflow-hidden">
      <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Calculator className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Live Food Labor Calculator</CardTitle>
              <CardDescription className="text-xs">Estimate real nutritional burden for any country or salary</CardDescription>
            </div>
          </div>
          <Badge variant={tierBadgeVariant(result.stressTier)} className="text-xs px-2.5 py-1">
            {result.stressTier} Food Stress
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 flex flex-col gap-6">
        {/* Country Selector & Wage Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Select Country (195 Nations)</span>
              {currentCountry.isEstimated && (
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 border-amber-500/30 text-amber-500 py-0">
                  Estimated
                </Badge>
              )}
            </label>
            <select
              value={selectedCountryId}
              onChange={(e) => setSelectedCountryId(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background/80 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {allCountries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.flag} {c.name} {c.isEstimated ? "(Est.)" : ""} (Median: {formatCurrency(c.monthlyMedianWageUSD, "USD")}/mo)
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Custom Monthly Salary ($ USD)</span>
              {isCustomWage && (
                <button
                  onClick={() => setCustomWageInput("")}
                  className="text-[10px] text-primary hover:underline"
                >
                  Reset to Median
                </button>
              )}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-semibold">$</span>
              <Input
                type="number"
                placeholder={`Default median: ${Math.round(currentCountry.monthlyMedianWageUSD)}`}
                value={customWageInput}
                onChange={(e) => setCustomWageInput(e.target.value)}
                className="pl-7 bg-background/80 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Estimation Notice */}
        {currentCountry.isEstimated && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400 space-y-0.5">
            <span className="font-bold">⚠️ Econometric Estimate for {currentCountry.name}:</span>
            <p className="text-[11px] leading-relaxed text-muted-foreground">{currentCountry.estimationDisclaimer}</p>
          </div>
        )}

        {/* Primary Metric Output Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border/60 bg-background/50 p-4 flex flex-col justify-between">
            <span className="text-xs text-muted-foreground font-medium">Monthly Food Basket Cost</span>
            <div className="my-1">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {formatCurrency(currentCountry.monthlyBasketCostUSD, "USD")}
              </span>
              <div className="text-[11px] text-muted-foreground">
                ≈ {formatCurrency(currentCountry.monthlyBasketCostLocal, currentCountry.currencyCode)}
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground">Standard 13-item basic nutrition</span>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/50 p-4 flex flex-col justify-between">
            <span className="text-xs text-muted-foreground font-medium">Labor Time Required</span>
            <div className="my-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-primary">
                {formatHours(result.laborHours)}
              </span>
              <span className="text-xs text-muted-foreground">/ month</span>
            </div>
            <div className="w-full bg-secondary/50 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500"
                style={{ width: `${Math.min(100, (result.laborHours / 160) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground mt-1">Out of 160 monthly work hours</span>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/50 p-4 flex flex-col justify-between">
            <span className="text-xs text-muted-foreground font-medium">Share of Total Wage</span>
            <div className="my-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {formatPercent(result.basketPercent)}
              </span>
              <span className="text-xs text-muted-foreground">of income</span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {result.basketPercent < 15 ? "🟢 High purchasing power" : result.basketPercent < 30 ? "🟡 Moderate food burden" : "🔴 Significant wage drain"}
            </span>
          </div>
        </div>

        {/* Granular Staple Work Time Contrast */}
        <div className="border-t border-border/40 pt-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Clock className="size-3.5 text-primary" />
            <span>Labor Minutes Required Per Essential Item ({currentCountry.name})</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="rounded-lg bg-muted/40 p-2.5 flex flex-col">
              <span className="text-muted-foreground">🍚 1 kg Rice</span>
              <span className="font-bold text-foreground text-sm mt-0.5">
                {riceItem ? formatMinutes(riceItem.minutesOfWorkPerUnit) : "—"}
              </span>
            </div>
            <div className="rounded-lg bg-muted/40 p-2.5 flex flex-col">
              <span className="text-muted-foreground">🥩 1 kg Beef</span>
              <span className="font-bold text-foreground text-sm mt-0.5">
                {beefItem ? formatMinutes(beefItem.minutesOfWorkPerUnit) : "—"}
              </span>
            </div>
            <div className="rounded-lg bg-muted/40 p-2.5 flex flex-col">
              <span className="text-muted-foreground">🍗 1 kg Chicken</span>
              <span className="font-bold text-foreground text-sm mt-0.5">
                {chickenItem ? formatMinutes(chickenItem.minutesOfWorkPerUnit) : "—"}
              </span>
            </div>
            <div className="rounded-lg bg-muted/40 p-2.5 flex flex-col">
              <span className="text-muted-foreground">🥚 12 Eggs</span>
              <span className="font-bold text-foreground text-sm mt-0.5">
                {eggsItem ? formatMinutes(eggsItem.minutesOfWorkPerUnit) : "—"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-border/40 bg-muted/10 p-4 flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Info className="size-3.5" />
          Global rank: #{currentCountry.rank} of {allCountries.length} countries
        </span>
        <a href={getBasePath(`compare?c1=${selectedCountryId}&c2=usa`)} className="inline-flex">
          <Button variant="outline" size="sm" className="text-xs gap-1">
            <span>Compare with USA</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
}
