import React, { useState, useMemo } from "react";
import { RAW_COUNTRIES } from "@/data/countries";
import { getAllProcessedCountries, getContinentalSummaries } from "@/lib/methodology";
import type { Continent, ContinentEconomySummary, ProcessedCountryEconomy } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatHours, formatPercent, getBasePath } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  Globe2,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export function ContinentComparator() {
  const allCountries = useMemo(() => getAllProcessedCountries(RAW_COUNTRIES), []);
  const continentSummaries = useMemo(() => getContinentalSummaries(allCountries), [allCountries]);

  const [selectedContinents, setSelectedContinents] = useState<Continent[]>([
    "Europe",
    "Americas",
    "Asia",
    "Oceania",
    "Africa",
  ]);

  const [expandedContinent, setExpandedContinent] = useState<Continent | null>("Europe");
  const [activeMetric, setActiveMetric] = useState<"hours" | "percent" | "wage" | "basket">("hours");

  const toggleContinentSelection = (cont: Continent) => {
    if (selectedContinents.includes(cont)) {
      if (selectedContinents.length > 1) {
        setSelectedContinents(selectedContinents.filter((c) => c !== cont));
      }
    } else {
      setSelectedContinents([...selectedContinents, cont]);
    }
  };

  const filteredSummaries = useMemo(() => {
    return continentSummaries.filter((s) => selectedContinents.includes(s.continent));
  }, [continentSummaries, selectedContinents]);

  // Data for Category Labor Hours Grouped Chart
  const categoryLaborData = useMemo(() => {
    const categories = [
      { key: "staples", name: "Staples & Grains" },
      { key: "meat", name: "Meat & Poultry" },
      { key: "dairy", name: "Dairy & Eggs" },
      { key: "produce", name: "Fresh Produce" },
      { key: "oil", name: "Cooking Oils" },
    ];

    return categories.map((cat) => {
      const entry: any = { category: cat.name };
      filteredSummaries.forEach((s) => {
        const hours = s.categoryLaborHours[cat.key as keyof typeof s.categoryLaborHours] || 0;
        entry[s.continent] = parseFloat(hours.toFixed(1));
      });
      return entry;
    });
  }, [filteredSummaries]);

  // Data for Overview Bar Chart
  const overviewChartData = useMemo(() => {
    return filteredSummaries.map((s) => ({
      name: s.continent,
      hours: parseFloat(s.avgLaborHours.toFixed(1)),
      wagePercent: parseFloat(s.avgBasketPercentOfWage.toFixed(1)),
      wageUSD: Math.round(s.avgMonthlyWageUSD),
      basketUSD: Math.round(s.avgBasketCostUSD),
      appiScore: s.avgAppiScore,
    }));
  }, [filteredSummaries]);

  const continentColors: Record<Continent, string> = {
    Europe: "hsl(var(--primary))",
    Americas: "hsl(var(--chart-2))",
    Asia: "hsl(var(--chart-3))",
    Oceania: "hsl(var(--chart-4))",
    Africa: "hsl(var(--chart-5))",
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Low": return "hsl(var(--success))";
      case "Moderate": return "hsl(var(--chart-3))";
      case "High": return "hsl(var(--chart-5))";
      default: return "hsl(var(--destructive))";
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs bg-primary/10 border-primary/20 text-primary gap-1">
            <Globe2 className="size-3.5" />
            <span>Continental Economics</span>
          </Badge>
          <span className="text-xs text-muted-foreground">• 195 Sovereign Nations • 5 Continents</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
          Global Continent Comparison
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
          Compare nutritional purchasing power and median labor requirements across the world's 5 continental regions. 
          Discover how baseline grocery costs and median take-home incomes create stark continental disparities.
        </p>
      </div>

      {/* 5 Continent Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {continentSummaries.map((summary, idx) => {
          const isExpanded = expandedContinent === summary.continent;
          return (
            <Card
              key={summary.continent}
              className={`border-border/80 bg-card/60 backdrop-blur p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer hover:border-primary/60 ${
                isExpanded ? "ring-2 ring-primary/40 bg-card/90 shadow-md" : ""
              }`}
              onClick={() => setExpandedContinent(isExpanded ? null : summary.continent)}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full" style={{ backgroundColor: continentColors[summary.continent] }}></span>
                    <h3 className="text-base font-bold text-foreground">{summary.continent}</h3>
                  </div>
                  <Badge variant="secondary" className="text-[11px] font-semibold">
                    {summary.countryCount} nations
                  </Badge>
                </div>

                <div className="space-y-3 my-3">
                  <div>
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Avg Labor For Basket</span>
                    <div className="text-2xl font-extrabold text-foreground mt-0.5">
                      {formatHours(summary.avgLaborHours)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ≈ {formatPercent(summary.avgBasketPercentOfWage)} of median wage
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Avg Net Wage</span>
                      <span className="font-semibold text-foreground">{formatCurrency(summary.avgMonthlyWageUSD)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Avg Basket</span>
                      <span className="font-semibold text-foreground">{formatCurrency(summary.avgBasketCostUSD)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/40 space-y-1 text-[11px]">
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                  <span className="truncate max-w-[110px]">🥇 {summary.bestCountry.flag} {summary.bestCountry.name}</span>
                  <span className="font-semibold">{formatHours(summary.bestCountry.laborHoursForBasket)}</span>
                </div>
                <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                  <span className="truncate max-w-[110px]">🔻 {summary.worstCountry.flag} {summary.worstCountry.name}</span>
                  <span className="font-semibold">{formatHours(summary.worstCountry.laborHoursForBasket)}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Interactive Continent Filter & Metric Selector */}
      <Card className="border-border/80 bg-card/60 backdrop-blur p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-foreground">Continental Benchmarks</h2>
            <p className="text-xs text-muted-foreground">
              Toggle continents on or off to adjust the comparison charts and labor decomposition
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(["Europe", "Americas", "Asia", "Oceania", "Africa"] as Continent[]).map((cont) => {
              const active = selectedContinents.includes(cont);
              return (
                <Button
                  key={cont}
                  variant={active ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleContinentSelection(cont)}
                  className="text-xs gap-1.5 h-8 font-medium"
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: active ? "currentColor" : continentColors[cont] }}
                  />
                  <span>{cont}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Comparison Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Metric Bar Chart */}
          <div className="lg:col-span-6 flex flex-col justify-between bg-background/50 rounded-xl p-4 border border-border/60">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {activeMetric === "hours" && "Average Monthly Labor Hours Required for Nutrition"}
                  {activeMetric === "percent" && "Average Percentage of Median Wage Consumed by Food"}
                  {activeMetric === "wage" && "Average Monthly Median Take-Home Wage (USD)"}
                  {activeMetric === "basket" && "Average Monthly Standard Grocery Basket Cost (USD)"}
                </h3>
                <span className="text-[11px] text-muted-foreground">Across all sovereign states in each region</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant={activeMetric === "hours" ? "secondary" : "ghost"}
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => setActiveMetric("hours")}
                >
                  Labor Hours
                </Button>
                <Button
                  variant={activeMetric === "percent" ? "secondary" : "ghost"}
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => setActiveMetric("percent")}
                >
                  Wage %
                </Button>
                <Button
                  variant={activeMetric === "wage" ? "secondary" : "ghost"}
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => setActiveMetric("wage")}
                >
                  Wage $
                </Button>
                <Button
                  variant={activeMetric === "basket" ? "secondary" : "ghost"}
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => setActiveMetric("basket")}
                >
                  Basket $
                </Button>
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overviewChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    unit={activeMetric === "hours" ? "h" : activeMetric === "percent" ? "%" : "$"}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border border-border/80 bg-popover p-3 shadow-md text-xs space-y-1.5">
                            <div className="font-bold text-popover-foreground text-sm">{data.name}</div>
                            <div className="flex justify-between gap-4 text-muted-foreground">
                              <span>Average Labor Effort:</span>
                              <span className="font-bold text-foreground">{formatHours(data.hours)}</span>
                            </div>
                            <div className="flex justify-between gap-4 text-muted-foreground">
                              <span>Wage Burden:</span>
                              <span className="font-bold text-foreground">{formatPercent(data.wagePercent)}</span>
                            </div>
                            <div className="flex justify-between gap-4 text-muted-foreground">
                              <span>Average Median Wage:</span>
                              <span className="font-bold text-foreground">{formatCurrency(data.wageUSD)}</span>
                            </div>
                            <div className="flex justify-between gap-4 text-muted-foreground">
                              <span>Average Basket Cost:</span>
                              <span className="font-bold text-foreground">{formatCurrency(data.basketUSD)}</span>
                            </div>
                            <div className="flex justify-between gap-4 text-muted-foreground">
                              <span>Average APPI Score:</span>
                              <span className="font-bold text-primary">{data.appiScore}/100</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey={
                      activeMetric === "hours"
                        ? "hours"
                        : activeMetric === "percent"
                        ? "wagePercent"
                        : activeMetric === "wage"
                        ? "wageUSD"
                        : "basketUSD"
                    }
                    radius={[6, 6, 0, 0]}
                  >
                    {overviewChartData.map((entry) => (
                      <Cell key={entry.name} fill={continentColors[entry.name as Continent] || "hsl(var(--primary))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Labor Decomposition Chart */}
          <div className="lg:col-span-6 flex flex-col justify-between bg-background/50 rounded-xl p-4 border border-border/60">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-foreground">
                Category Labor Effort Decomposition (Hours)
              </h3>
              <span className="text-[11px] text-muted-foreground">
                Average hours of work required for each food category by continent
              </span>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryLaborData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="category"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    unit="h"
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border border-border/80 bg-popover p-3 shadow-md text-xs space-y-1">
                            <div className="font-bold text-popover-foreground mb-1">{label}</div>
                            {payload.map((p: any) => (
                              <div key={p.name} className="flex justify-between gap-4">
                                <span className="flex items-center gap-1.5">
                                  <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
                                  <span className="text-muted-foreground">{p.name}:</span>
                                </span>
                                <span className="font-bold text-foreground">{formatHours(p.value)}</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  />
                  {filteredSummaries.map((s) => (
                    <Bar
                      key={s.continent}
                      dataKey={s.continent}
                      fill={continentColors[s.continent]}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Stress Tier Distribution Breakdown */}
        <div className="mt-6 pt-6 border-t border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Nutritional Stress Tier Distribution by Continent
              </h3>
              <span className="text-xs text-muted-foreground">
                Proportion of nations in Low (&lt;10%), Moderate (10-20%), High (20-35%), and Severe (&gt;35%) wage burden
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-emerald-500"></span>
                <span>Low</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-amber-500"></span>
                <span>Moderate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-orange-500"></span>
                <span>High</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-rose-500"></span>
                <span>Severe</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {continentSummaries.map((s) => {
              const total = s.countryCount;
              const lowPct = (s.tierDistribution.Low / total) * 100;
              const modPct = (s.tierDistribution.Moderate / total) * 100;
              const highPct = (s.tierDistribution.High / total) * 100;
              const sevPct = (s.tierDistribution.Severe / total) * 100;

              return (
                <div key={s.continent} className="space-y-1 bg-background/40 p-3 rounded-lg border border-border/40">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: continentColors[s.continent] }} />
                      {s.continent} ({s.countryCount} nations)
                    </span>
                    <span className="text-muted-foreground">
                      Avg Effort: <strong className="text-foreground">{formatHours(s.avgLaborHours)}</strong> ({formatPercent(s.avgBasketPercentOfWage)})
                    </span>
                  </div>

                  {/* Multi-segment progress bar */}
                  <div className="h-4 w-full rounded-full bg-muted overflow-hidden flex shadow-inner">
                    {s.tierDistribution.Low > 0 && (
                      <div
                        style={{ width: `${lowPct}%` }}
                        className="bg-emerald-500 transition-all flex items-center justify-center text-[10px] text-white font-bold"
                        title={`Low Burden: ${s.tierDistribution.Low} countries (${lowPct.toFixed(0)}%)`}
                      >
                        {lowPct > 10 ? `${s.tierDistribution.Low}` : ""}
                      </div>
                    )}
                    {s.tierDistribution.Moderate > 0 && (
                      <div
                        style={{ width: `${modPct}%` }}
                        className="bg-amber-500 transition-all flex items-center justify-center text-[10px] text-white font-bold"
                        title={`Moderate Burden: ${s.tierDistribution.Moderate} countries (${modPct.toFixed(0)}%)`}
                      >
                        {modPct > 10 ? `${s.tierDistribution.Moderate}` : ""}
                      </div>
                    )}
                    {s.tierDistribution.High > 0 && (
                      <div
                        style={{ width: `${highPct}%` }}
                        className="bg-orange-500 transition-all flex items-center justify-center text-[10px] text-white font-bold"
                        title={`High Burden: ${s.tierDistribution.High} countries (${highPct.toFixed(0)}%)`}
                      >
                        {highPct > 10 ? `${s.tierDistribution.High}` : ""}
                      </div>
                    )}
                    {s.tierDistribution.Severe > 0 && (
                      <div
                        style={{ width: `${sevPct}%` }}
                        className="bg-rose-500 transition-all flex items-center justify-center text-[10px] text-white font-bold"
                        title={`Severe Burden: ${s.tierDistribution.Severe} countries (${sevPct.toFixed(0)}%)`}
                      >
                        {sevPct > 10 ? `${s.tierDistribution.Severe}` : ""}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Continental Drilldown & Country Directory */}
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            Continental Directory & Member Economies
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Click on any continent to view all of its member countries sorted from lowest food burden to highest
          </p>
        </div>

        <div className="space-y-4">
          {continentSummaries.map((summary) => {
            const isExpanded = expandedContinent === summary.continent;
            return (
              <Card
                key={summary.continent}
                className="border-border/80 bg-card/70 backdrop-blur overflow-hidden transition-all duration-200"
              >
                <div
                  onClick={() => setExpandedContinent(isExpanded ? null : summary.continent)}
                  className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {isExpanded ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="size-3 rounded-full" style={{ backgroundColor: continentColors[summary.continent] }} />
                        <h3 className="text-lg font-bold text-foreground">{summary.continent}</h3>
                        <Badge variant="outline" className="text-xs">
                          {summary.countryCount} Sovereign Nations
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Average: {formatHours(summary.avgLaborHours)} labor • {formatPercent(summary.avgBasketPercentOfWage)} of income • Median Wage {formatCurrency(summary.avgMonthlyWageUSD)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right hidden sm:block">
                      <span className="text-muted-foreground block text-[10px]">Leader</span>
                      <span className="font-semibold text-emerald-500">
                        {summary.bestCountry.flag} {summary.bestCountry.name} ({formatHours(summary.bestCountry.laborHoursForBasket)})
                      </span>
                    </div>
                    <div className="text-right hidden sm:block">
                      <span className="text-muted-foreground block text-[10px]">Highest Strain</span>
                      <span className="font-semibold text-rose-500">
                        {summary.worstCountry.flag} {summary.worstCountry.name} ({formatHours(summary.worstCountry.laborHoursForBasket)})
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {isExpanded ? "Collapse" : "Expand Nations"}
                    </Badge>
                  </div>
                </div>

                {/* Country Directory Grid */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-border/40 bg-background/30">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-4">
                      {summary.countries.map((c) => (
                        <div
                          key={c.id}
                          className="rounded-xl border border-border/70 bg-card/90 p-3 flex flex-col justify-between hover:border-primary/50 transition-all text-xs"
                        >
                          <div className="flex items-start justify-between gap-1.5 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{c.flag}</span>
                              <div>
                                <span className="font-bold text-foreground block truncate max-w-[130px]" title={c.name}>
                                  {c.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground">Rank #{c.rank} • {c.code}</span>
                              </div>
                            </div>
                            {c.isEstimated && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 bg-amber-500/10 border-amber-500/30 text-amber-500" title="Econometrically estimated">
                                Est.
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-1 pt-2 border-t border-border/30">
                            <div className="flex justify-between text-muted-foreground">
                              <span>Labor Hours:</span>
                              <span className="font-bold text-foreground">{formatHours(c.laborHoursForBasket)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Wage Burden:</span>
                              <span className="font-semibold text-foreground">{formatPercent(c.basketPercentOfWage)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Median Wage:</span>
                              <span className="font-medium text-foreground">{formatCurrency(c.monthlyMedianWageUSD)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Basket Cost:</span>
                              <span className="font-medium text-foreground">{formatCurrency(c.monthlyBasketCostUSD)}</span>
                            </div>
                          </div>

                          <div className="pt-2 mt-2 border-t border-border/30 flex justify-between items-center">
                            <Badge
                              variant="outline"
                              className="text-[9px]"
                              style={{
                                color: getTierColor(c.stressTier),
                                borderColor: `${getTierColor(c.stressTier)}40`,
                              }}
                            >
                              {c.stressTier} Stress
                            </Badge>
                            <a
                              href={getBasePath(`/compare?c1=${c.id}&c2=${summary.bestCountry.id}`)}
                              className="text-[10px] text-primary font-medium hover:underline inline-flex items-center gap-0.5"
                            >
                              Compare <ArrowRight className="size-2.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Disclaimers & Methodology Alert */}
      <Card className="border-border/80 bg-muted/20 p-5 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
            <Sparkles className="size-4" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-foreground">Continental Aggregation Methodology & Data Transparency</h4>
            <p className="text-muted-foreground leading-relaxed">
              Continental statistics are unweighted arithmetic means calculated across all 195 sovereign states in each region (54 Africa, 35 Americas, 48 Asia, 44 Europe, 14 Oceania). 
              For closed economies or nations experiencing active conflict (e.g. North Korea, Eritrea, Syria, Afghanistan), figures are derived from UN WFP food security baselines and regional econometric regressions.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
