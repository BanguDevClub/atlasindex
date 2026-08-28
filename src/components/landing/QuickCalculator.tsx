import React, { useState, useMemo } from "react";
import { RAW_COUNTRIES } from "@/data/countries";
import { getAllProcessedCountries, getGlobalSummary, calculateCustomWageEffort } from "@/lib/methodology";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/SearchableSelect";
import { formatCurrency, formatHours, formatMinutes, formatPercent, getBasePath } from "@/lib/utils";
import { Calculator, ArrowRight, Utensils, Home, Car, Stethoscope, Info, Sparkles } from "lucide-react";

export function QuickCalculator() {
  const allCountries = useMemo(() => getAllProcessedCountries(RAW_COUNTRIES), []);
  const globalSummary = useMemo(() => getGlobalSummary(allCountries), [allCountries]);

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
      rentPercent: currentCountry.rentPercentOfWage,
      rentHours: currentCountry.rentLaborHours,
      carMonths: currentCountry.carLaborMonths,
      medicalPercent: currentCountry.medicalCheckupPercentOfWage,
      medicalHours: currentCountry.medicalCheckupLaborHours,
      totalEssentialPercent: currentCountry.totalEssentialPercentOfWage,
      totalEssentialHours: currentCountry.totalEssentialLaborHours,
      stressTier: currentCountry.stressTier,
    };
  }, [currentCountry, isCustomWage, customWageUSD]);

  // Transform countries into searchable options with metadata
  const countryOptions: SearchableSelectOption[] = useMemo(() => {
    return allCountries.map((c) => ({
      value: c.id,
      label: c.name,
      sublabel: `Median Wage: ${formatCurrency(c.monthlyMedianWageUSD, "USD")}/mo • Food: ${c.laborHoursForBasket.toFixed(1)}h`,
      icon: <span className="text-base">{c.flag}</span>,
      badge: c.isEstimated ? "Est." : c.code,
      badgeVariant: c.isEstimated ? "warning" : "default",
      group: c.continent,
      keywords: [c.code, c.continent, c.currencyCode, c.isEstimated ? "estimated" : "official"],
    }));
  }, [allCountries]);

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
    <Card className="border-border/80 bg-card/70 backdrop-blur-md shadow-xl relative z-20 overflow-visible">
      <CardHeader className="border-b border-border/40 bg-muted/20 pb-4 px-4 sm:px-6 rounded-t-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Calculator className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Multi-Pillar Labor & Living Cost Calculator</CardTitle>
              <CardDescription className="text-xs">Estimate real nutritional, housing, and healthcare effort for any country or custom wage</CardDescription>
            </div>
          </div>
          <Badge variant={tierBadgeVariant(result.stressTier)} className="text-xs px-2.5 py-1">
            {result.stressTier} Food Stress
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 flex flex-col gap-6">
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
            <SearchableSelect
              options={countryOptions}
              value={selectedCountryId}
              onChange={setSelectedCountryId}
              searchPlaceholder="Type country name, ISO code (e.g. USA, BRA, JPN)..."
              groupByCategory={true}
              size="default"
              ariaLabel="Select Country"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Custom Monthly Salary ($ USD)</span>
              {isCustomWage && (
                <button
                  onClick={() => setCustomWageInput("")}
                  className="text-[10px] text-primary hover:underline font-semibold"
                >
                  Reset to Median (${Math.round(currentCountry.monthlyMedianWageUSD)})
                </button>
              )}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-semibold">$</span>
              <Input
                type="number"
                placeholder={`Default median: ${Math.round(currentCountry.monthlyMedianWageUSD)} / month`}
                value={customWageInput}
                onChange={(e) => setCustomWageInput(e.target.value)}
                className="pl-7 bg-background/80 text-sm h-10 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Estimation Notice */}
        {currentCountry.isEstimated && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400 space-y-0.5">
            <span className="font-bold flex items-center gap-1.5">
              <span>⚠️</span>
              <span>Econometric Estimate for {currentCountry.name}:</span>
            </span>
            <p className="text-[11px] leading-relaxed text-muted-foreground">{currentCountry.estimationDisclaimer}</p>
          </div>
        )}

        {/* 4 Pillars Output Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Pillar 1: Food Basket */}
          <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 flex flex-col justify-between gap-3">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
              <Utensils className="size-3.5 text-primary" /> Monthly Food Basket
            </span>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-extrabold text-foreground">{formatHours(result.laborHours)}</span>
                <span className="text-xs text-muted-foreground font-medium">({formatPercent(result.basketPercent)})</span>
              </div>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                Cost: {formatCurrency(currentCountry.monthlyBasketCostUSD, "USD")} / month
              </span>
            </div>
            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Global Avg:</span>
              <span className="font-semibold text-foreground">{globalSummary.avgLaborHoursFood.toFixed(1)}h</span>
            </div>
          </div>

          {/* Pillar 2: 1-BR Rent */}
          <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 flex flex-col justify-between gap-3">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
              <Home className="size-3.5 text-chart-2" /> 1-Bedroom Rent
            </span>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-extrabold text-foreground">{formatPercent(result.rentPercent)}</span>
                <span className="text-xs text-muted-foreground font-medium">({formatHours(result.rentHours)})</span>
              </div>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                Cost: {formatCurrency(currentCountry.rentMonthlyUSD, "USD")} / month
              </span>
            </div>
            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Global Avg:</span>
              <span className="font-semibold text-foreground">{formatPercent(globalSummary.avgRentPercentOfWage)}</span>
            </div>
          </div>

          {/* Pillar 3: Passenger Car */}
          <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 flex flex-col justify-between gap-3">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
              <Car className="size-3.5 text-chart-4" /> New Passenger Car
            </span>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-extrabold text-foreground">{result.carMonths.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground font-medium">months</span>
              </div>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                MSRP: {formatCurrency(currentCountry.carPriceUSD, "USD")}
              </span>
            </div>
            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Global Avg:</span>
              <span className="font-semibold text-foreground">{globalSummary.avgCarLaborMonths.toFixed(1)} mo</span>
            </div>
          </div>

          {/* Pillar 4: Medical Checkup */}
          <div className="rounded-xl border border-border/60 bg-background/50 p-3.5 flex flex-col justify-between gap-3">
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
              <Stethoscope className="size-3.5 text-rose-500" /> Medical Exam
            </span>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-extrabold text-foreground">{formatHours(result.medicalHours)}</span>
                <span className="text-xs text-muted-foreground font-medium">({formatPercent(result.medicalPercent)})</span>
              </div>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                Tariff: {formatCurrency(currentCountry.medicalCheckupUSD, "USD")}
              </span>
            </div>
            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Global Avg:</span>
              <span className="font-semibold text-foreground">{formatHours(globalSummary.avgMedicalCheckupLaborHours)}</span>
            </div>
          </div>
        </div>

        {/* Combined Essential Burden */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" />
              <span>Combined Essential Living Strain (Food Basket + 1-BR Rent)</span>
            </span>
            <p className="text-[11px] text-muted-foreground">
              Total monthly labor required just to eat and stay sheltered
            </p>
          </div>
          <div className="flex items-baseline gap-2 sm:text-right">
            <span className="text-lg sm:text-xl font-extrabold text-primary">{formatHours(result.totalEssentialHours)}</span>
            <span className="text-xs font-bold text-muted-foreground">({formatPercent(result.totalEssentialPercent)} of wage)</span>
          </div>
        </div>

        {/* Granular Food Items Preview */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-muted-foreground uppercase tracking-wider">Labor Minutes per Grocery Staple</span>
            <span className="text-[11px] text-muted-foreground hidden sm:inline">Based on {currentCountry.name} hourly wage ({formatCurrency(currentCountry.hourlyMedianWageUSD, "USD")}/h)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {riceItem && (
              <div className="rounded-lg border border-border/40 bg-muted/20 p-2.5 flex flex-col justify-between gap-1">
                <span className="text-[11px] text-muted-foreground font-medium">🍚 1kg Rice</span>
                <span className="text-sm font-bold text-foreground">{formatMinutes(riceItem.minutesOfWorkPerUnit)}</span>
              </div>
            )}
            {chickenItem && (
              <div className="rounded-lg border border-border/40 bg-muted/20 p-2.5 flex flex-col justify-between gap-1">
                <span className="text-[11px] text-muted-foreground font-medium">🍗 1kg Chicken</span>
                <span className="text-sm font-bold text-foreground">{formatMinutes(chickenItem.minutesOfWorkPerUnit)}</span>
              </div>
            )}
            {beefItem && (
              <div className="rounded-lg border border-border/40 bg-muted/20 p-2.5 flex flex-col justify-between gap-1">
                <span className="text-[11px] text-muted-foreground font-medium">🥩 1kg Beef</span>
                <span className="text-sm font-bold text-foreground">{formatMinutes(beefItem.minutesOfWorkPerUnit)}</span>
              </div>
            )}
            {eggsItem && (
              <div className="rounded-lg border border-border/40 bg-muted/20 p-2.5 flex flex-col justify-between gap-1">
                <span className="text-[11px] text-muted-foreground font-medium">🥚 1 Dozen Eggs</span>
                <span className="text-sm font-bold text-foreground">{formatMinutes(eggsItem.minutesOfWorkPerUnit)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-border/40 bg-muted/20 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground text-center sm:text-left">
          <Info className="size-3.5 shrink-0 text-primary" />
          <span>Full-time baseline standardized to 160 labor hours / month (40h/week).</span>
        </div>
        <a
          href={getBasePath(`/compare?c1=${currentCountry.id}&c2=world-average`)}
          className="inline-flex items-center gap-1.5 text-primary hover:underline font-semibold w-full sm:w-auto justify-center"
        >
          <span>Compare {currentCountry.name} vs World Average</span>
          <ArrowRight className="size-3" />
        </a>
      </CardFooter>
    </Card>
  );
}
