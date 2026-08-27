import React, { useState, useMemo } from "react";
import { RAW_COUNTRIES } from "@/data/countries";
import { getAllProcessedCountries, getContinentalSummaries, getGlobalSummary } from "@/lib/methodology";
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
  Home,
  Car,
  Stethoscope,
  Utensils,
  Globe,
} from "lucide-react";

type ContinentalMetric = "foodHours" | "foodPercent" | "rentUSD" | "rentPercent" | "carMonths" | "medHours" | "wageUSD";

export function ContinentComparator() {
  const allCountries = useMemo(() => getAllProcessedCountries(RAW_COUNTRIES), []);
  const continentSummaries = useMemo(() => getContinentalSummaries(allCountries), [allCountries]);
  const globalSummary = useMemo(() => getGlobalSummary(allCountries), [allCountries]);

  const [selectedContinents, setSelectedContinents] = useState<Continent[]>([
    "Europe",
    "Americas",
    "Asia",
    "Oceania",
    "Africa",
  ]);

  const [expandedContinent, setExpandedContinent] = useState<Continent | null>("Europe");
  const [activeMetric, setActiveMetric] = useState<ContinentalMetric>("foodHours");

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

  // Data for Overview Bar Chart including World Average
  const overviewChartData = useMemo(() => {
    const data: Array<{
      name: string;
      foodHours: number;
      foodPercent: number;
      rentUSD: number;
      rentPercent: number;
      carMonths: number;
      medHours: number;
      wageUSD: number;
      isGlobal: boolean;
    }> = filteredSummaries.map((s) => ({
      name: s.continent as string,
      foodHours: parseFloat(s.avgLaborHours.toFixed(1)),
      foodPercent: parseFloat(s.avgBasketPercentOfWage.toFixed(1)),
      rentUSD: Math.round(s.avgRentUSD),
      rentPercent: parseFloat(s.avgRentPercentOfWage.toFixed(1)),
      carMonths: parseFloat(s.avgCarLaborMonths.toFixed(1)),
      medHours: parseFloat(s.avgMedicalCheckupLaborHours.toFixed(1)),
      wageUSD: Math.round(s.avgMonthlyWageUSD),
      isGlobal: false,
    }));

    // Add Global Benchmark entry
    data.push({
      name: "🌐 World Avg",
      foodHours: parseFloat(globalSummary.avgLaborHoursFood.toFixed(1)),
      foodPercent: parseFloat(globalSummary.avgBasketPercentOfWage.toFixed(1)),
      rentUSD: Math.round(globalSummary.avgRentUSD),
      rentPercent: parseFloat(globalSummary.avgRentPercentOfWage.toFixed(1)),
      carMonths: parseFloat(globalSummary.avgCarLaborMonths.toFixed(1)),
      medHours: parseFloat(globalSummary.avgMedicalCheckupLaborHours.toFixed(1)),
      wageUSD: Math.round(globalSummary.avgMonthlyWageUSD),
      isGlobal: true,
    });

    return data;
  }, [filteredSummaries, globalSummary]);

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
            <span>Continental Living Standards</span>
          </Badge>
          <span className="text-xs text-muted-foreground">• 195 Sovereign Nations • 5 Continents & Global Benchmark</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
          Global Continent & Benchmark Comparison
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
          Compare purchasing power across Food, Housing (1-BR Rent), Transport (Car Purchase), and Healthcare (Medical Exams) across the world's 5 continental regions and the <strong>Global 195 Nations Average</strong>.
        </p>
      </div>

      {/* Global Average Baseline Callout */}
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 backdrop-blur flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
            <Globe className="size-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>World Average Baseline (195 Sovereign Nations)</span>
              <Badge variant="secondary" className="text-[10px] bg-primary/20 text-primary font-mono">
                100% Global Coverage
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Average Net Median Wage: <strong>${globalSummary.avgMonthlyWageUSD.toFixed(0)}/mo</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
          <div className="p-2 rounded-lg bg-background/60 border border-border/40">
            <span className="text-muted-foreground text-[10px] block">Food Basket:</span>
            <span className="font-bold text-primary">${globalSummary.avgBasketCostUSD.toFixed(0)} ({globalSummary.avgLaborHoursFood.toFixed(1)}h)</span>
          </div>
          <div className="p-2 rounded-lg bg-background/60 border border-border/40">
            <span className="text-muted-foreground text-[10px] block">1-BR Rent:</span>
            <span className="font-bold text-chart-2">${globalSummary.avgRentUSD.toFixed(0)} ({globalSummary.avgRentPercentOfWage.toFixed(1)}%)</span>
          </div>
          <div className="p-2 rounded-lg bg-background/60 border border-border/40">
            <span className="text-muted-foreground text-[10px] block">Car Purchase:</span>
            <span className="font-bold text-chart-4">{globalSummary.avgCarLaborMonths.toFixed(1)} months</span>
          </div>
          <div className="p-2 rounded-lg bg-background/60 border border-border/40">
            <span className="text-muted-foreground text-[10px] block">Medical Exam:</span>
            <span className="font-bold text-rose-500">${globalSummary.avgMedicalCheckupUSD.toFixed(1)} ({globalSummary.avgMedicalCheckupLaborHours.toFixed(1)}h)</span>
          </div>
        </div>
      </div>

      {/* 5 Continent Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {continentSummaries.map((summary) => {
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

                <div className="space-y-2.5 my-3">
                  <div>
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Avg Food Labor</span>
                    <div className="text-2xl font-extrabold text-foreground mt-0.5">
                      {formatHours(summary.avgLaborHours)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ≈ {formatPercent(summary.avgBasketPercentOfWage)} of median wage
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">1-BR Rent</span>
                      <span className="font-semibold text-chart-2">${summary.avgRentUSD.toFixed(0)} ({formatPercent(summary.avgRentPercentOfWage)})</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Car Purchase</span>
                      <span className="font-semibold text-chart-4">{summary.avgCarLaborMonths.toFixed(1)} mos</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/30 text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Medical Checkup</span>
                      <span className="font-semibold text-rose-500">${summary.avgMedicalCheckupUSD.toFixed(0)} ({formatHours(summary.avgMedicalCheckupLaborHours)})</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Median Wage</span>
                      <span className="font-semibold text-foreground">${summary.avgMonthlyWageUSD.toFixed(0)}/mo</span>
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
            <h2 className="text-lg font-bold text-foreground">Multi-Pillar Continental Benchmarks</h2>
            <p className="text-xs text-muted-foreground">
              Compare regional averages across Food, Rent, Vehicle, Healthcare, and Wage metrics against the World Average
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

        {/* Metric Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4 bg-muted/40 p-1.5 rounded-xl">
          <Button
            variant={activeMetric === "foodHours" ? "default" : "ghost"}
            size="sm"
            className="text-xs h-7 px-2.5 gap-1"
            onClick={() => setActiveMetric("foodHours")}
          >
            <Utensils className="size-3" />
            <span>Food (Labor Hours)</span>
          </Button>
          <Button
            variant={activeMetric === "foodPercent" ? "default" : "ghost"}
            size="sm"
            className="text-xs h-7 px-2.5 gap-1"
            onClick={() => setActiveMetric("foodPercent")}
          >
            <Utensils className="size-3" />
            <span>Food (Wage %)</span>
          </Button>
          <Button
            variant={activeMetric === "rentUSD" ? "default" : "ghost"}
            size="sm"
            className="text-xs h-7 px-2.5 gap-1"
            onClick={() => setActiveMetric("rentUSD")}
          >
            <Home className="size-3" />
            <span>1-BR Rent ($)</span>
          </Button>
          <Button
            variant={activeMetric === "rentPercent" ? "default" : "ghost"}
            size="sm"
            className="text-xs h-7 px-2.5 gap-1"
            onClick={() => setActiveMetric("rentPercent")}
          >
            <Home className="size-3" />
            <span>Rent (Wage %)</span>
          </Button>
          <Button
            variant={activeMetric === "carMonths" ? "default" : "ghost"}
            size="sm"
            className="text-xs h-7 px-2.5 gap-1"
            onClick={() => setActiveMetric("carMonths")}
          >
            <Car className="size-3" />
            <span>Car (Labor Months)</span>
          </Button>
          <Button
            variant={activeMetric === "medHours" ? "default" : "ghost"}
            size="sm"
            className="text-xs h-7 px-2.5 gap-1"
            onClick={() => setActiveMetric("medHours")}
          >
            <Stethoscope className="size-3" />
            <span>Medical Exam (Labor Hours)</span>
          </Button>
          <Button
            variant={activeMetric === "wageUSD" ? "default" : "ghost"}
            size="sm"
            className="text-xs h-7 px-2.5 gap-1"
            onClick={() => setActiveMetric("wageUSD")}
          >
            <span>Monthly Wage ($)</span>
          </Button>
        </div>

        {/* Overview Comparison Bar Chart */}
        <div className="h-[340px] w-full bg-background/50 rounded-xl p-4 border border-border/60">
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
                unit={
                  activeMetric.includes("Hours") || activeMetric === "foodHours" || activeMetric === "medHours"
                    ? "h"
                    : activeMetric.includes("Percent") || activeMetric === "foodPercent" || activeMetric === "rentPercent"
                    ? "%"
                    : activeMetric === "carMonths"
                    ? " mo"
                    : "$"
                }
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-border/80 bg-popover p-3 shadow-md text-xs space-y-1.5">
                        <div className="font-bold text-popover-foreground text-sm">{data.name}</div>
                        <div className="flex justify-between gap-4 text-muted-foreground">
                          <span>Food Labor Hours:</span>
                          <span className="font-bold text-foreground">{formatHours(data.foodHours)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-muted-foreground">
                          <span>Food Wage Share:</span>
                          <span className="font-bold text-primary">{formatPercent(data.foodPercent)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-muted-foreground">
                          <span>1-BR Rent Cost:</span>
                          <span className="font-bold text-chart-2">${data.rentUSD}/mo ({formatPercent(data.rentPercent)})</span>
                        </div>
                        <div className="flex justify-between gap-4 text-muted-foreground">
                          <span>Car Purchase:</span>
                          <span className="font-bold text-chart-4">{data.carMonths} months of wage</span>
                        </div>
                        <div className="flex justify-between gap-4 text-muted-foreground">
                          <span>Medical Checkup:</span>
                          <span className="font-bold text-rose-500">{formatHours(data.medHours)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-muted-foreground pt-1 border-t border-border/40">
                          <span>Median Wage:</span>
                          <span className="font-bold text-foreground">${data.wageUSD}/mo</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey={activeMetric} radius={[6, 6, 0, 0]}>
                {overviewChartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.isGlobal ? "hsl(var(--primary))" : continentColors[entry.name as Continent] || "hsl(var(--chart-2))"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
                        Avg Wage: ${summary.avgMonthlyWageUSD.toFixed(0)}/mo • Food: {formatHours(summary.avgLaborHours)} ({formatPercent(summary.avgBasketPercentOfWage)}) • Rent: ${summary.avgRentUSD.toFixed(0)}/mo • Car: {summary.avgCarLaborMonths.toFixed(1)} mos
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
                              <span>Food Labor:</span>
                              <span className="font-bold text-foreground">{formatHours(c.laborHoursForBasket)} ({formatPercent(c.basketPercentOfWage)})</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>1-BR Rent:</span>
                              <span className="font-semibold text-chart-2">${c.rentMonthlyUSD.toFixed(0)}/mo</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Car Purchase:</span>
                              <span className="font-semibold text-chart-4">{c.carLaborMonths.toFixed(1)} months</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Medical Exam:</span>
                              <span className="font-semibold text-rose-500">${c.medicalCheckupUSD.toFixed(1)}</span>
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
                              href={getBasePath(`/compare?c1=${c.id}&c2=world-average`)}
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
