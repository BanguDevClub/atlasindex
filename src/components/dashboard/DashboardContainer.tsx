import React, { useState, useMemo } from "react";
import { RAW_COUNTRIES } from "@/data/countries";
import { getAllProcessedCountries, getGlobalSummary } from "@/lib/methodology";
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
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  CartesianGrid,
} from "recharts";
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/SearchableSelect";
import {
  TrendingDown,
  Clock,
  Filter,
  BarChart3,
  Search,
  Home,
  Car,
  Stethoscope,
  Globe,
  Utensils,
  Layers,
} from "lucide-react";

type ChartTab = "food" | "rent" | "car" | "medical" | "categories" | "scatter";

export function DashboardContainer() {
  const allCountries = useMemo(() => getAllProcessedCountries(RAW_COUNTRIES), []);
  const globalSummary = useMemo(() => getGlobalSummary(allCountries), [allCountries]);

  const [selectedContinent, setSelectedContinent] = useState<string>("All");
  const [selectedTier, setSelectedTier] = useState<string>("All");
  const [activeChartTab, setActiveChartTab] = useState<ChartTab>("food");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filtered countries
  const filteredCountries = useMemo(() => {
    return allCountries.filter((c) => {
      const matchContinent = selectedContinent === "All" || c.continent === selectedContinent;
      const matchTier = selectedTier === "All" || c.stressTier === selectedTier;
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchContinent && matchTier && matchSearch;
    });
  }, [allCountries, selectedContinent, selectedTier, searchQuery]);

  // Aggregate Metrics for current filtered set
  const filteredStats = useMemo(() => {
    if (filteredCountries.length === 0) {
      return {
        avgWage: 0,
        avgFoodHours: 0,
        avgFoodPercent: 0,
        avgRentUSD: 0,
        avgRentHours: 0,
        avgRentPercent: 0,
        avgCarMonths: 0,
        avgMedHours: 0,
        avgMedPercent: 0,
      };
    }
    const count = filteredCountries.length;
    return {
      avgWage: filteredCountries.reduce((sum, c) => sum + c.monthlyMedianWageUSD, 0) / count,
      avgFoodHours: filteredCountries.reduce((sum, c) => sum + c.laborHoursForBasket, 0) / count,
      avgFoodPercent: filteredCountries.reduce((sum, c) => sum + c.basketPercentOfWage, 0) / count,
      avgRentUSD: filteredCountries.reduce((sum, c) => sum + c.rentMonthlyUSD, 0) / count,
      avgRentHours: filteredCountries.reduce((sum, c) => sum + c.rentLaborHours, 0) / count,
      avgRentPercent: filteredCountries.reduce((sum, c) => sum + c.rentPercentOfWage, 0) / count,
      avgCarMonths: filteredCountries.reduce((sum, c) => sum + c.carLaborMonths, 0) / count,
      avgMedHours: filteredCountries.reduce((sum, c) => sum + c.medicalCheckupLaborHours, 0) / count,
      avgMedPercent: filteredCountries.reduce((sum, c) => sum + c.medicalCheckupPercentOfWage, 0) / count,
    };
  }, [filteredCountries]);

  // Data formatted for Category Stacked Chart
  const categoryChartData = useMemo(() => {
    return filteredCountries.map((c) => ({
      name: `${c.flag} ${c.code}`,
      fullName: c.name,
      staples: parseFloat(c.categoryLaborHours.staples.toFixed(1)),
      meat: parseFloat(c.categoryLaborHours.meat.toFixed(1)),
      dairy: parseFloat(c.categoryLaborHours.dairy.toFixed(1)),
      produce: parseFloat(c.categoryLaborHours.produce.toFixed(1)),
      oil: parseFloat(c.categoryLaborHours.oil.toFixed(1)),
      totalHours: parseFloat(c.laborHoursForBasket.toFixed(1)),
    }));
  }, [filteredCountries]);

  // Data for Scatter Plot (Wage vs Basket Cost)
  const scatterData = useMemo(() => {
    return filteredCountries.map((c) => ({
      name: `${c.flag} ${c.name}`,
      wageUSD: Math.round(c.monthlyMedianWageUSD),
      basketUSD: Math.round(c.monthlyBasketCostUSD),
      rentUSD: Math.round(c.rentMonthlyUSD),
      carPriceUSD: Math.round(c.carPriceUSD),
      medicalUSD: Math.round(c.medicalCheckupUSD),
      laborHours: parseFloat(c.laborHoursForBasket.toFixed(1)),
      wagePercent: parseFloat(c.basketPercentOfWage.toFixed(1)),
      continent: c.continent,
      tier: c.stressTier,
    }));
  }, [filteredCountries]);

  const continents = ["All", "Europe", "Americas", "Asia", "Oceania", "Africa"];
  const tiers = ["All", "Low", "Moderate", "High", "Severe"];

  const tierFilterOptions: SearchableSelectOption[] = useMemo(() => {
    return tiers.map((t) => ({
      value: t,
      label: t === "All" ? "All Stress Tiers" : `${t} Stress`,
      badge: t !== "All" ? t : undefined,
      badgeVariant:
        t === "Low"
          ? "success"
          : t === "Moderate"
          ? "warning"
          : t === "High"
          ? "secondary"
          : "destructive",
    }));
  }, [tiers]);

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs bg-primary/10 border-primary/20 text-primary">
              Global Overview Analytics
            </Badge>
            <span className="text-xs text-muted-foreground">• Universal 195 Sovereign Nations Audit</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Global Labor Effort & Living Pillars Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            Compare median purchasing power across Food, Housing (1-BR Rent), Transport (Car Purchase), and Healthcare (Medical Checkups) across all {allCountries.length} countries against the <strong>Global Average benchmark</strong>.
          </p>
        </div>

        <a href={getBasePath("/continents")} className="shrink-0">
          <Button variant="outline" size="sm" className="text-xs gap-1.5 border-primary/30 hover:bg-primary/10 text-primary font-semibold rounded-xl">
            <span>Continent Breakdown</span>
            <span>→</span>
          </Button>
        </a>
      </div>

      {/* Global Average Benchmark Banner */}
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5 backdrop-blur shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-primary/20 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
              <Globe className="size-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground flex items-center gap-2">
                <span>Global Average Baseline (195 Nations Synthesis)</span>
                <Badge variant="secondary" className="text-[10px] bg-primary/20 text-primary font-mono">
                  World Avg
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Arithmetic benchmark across all 195 sovereign states. Median Monthly Wage: <strong>${globalSummary.avgMonthlyWageUSD.toFixed(0)}/mo</strong> • Composite APPI: <strong className="text-primary">{globalSummary.avgAppiScore} / 100</strong> (Essentials: {globalSummary.avgAppiEssentials}, Luxury: {globalSummary.avgAppiLuxury})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-xl bg-primary/10 border border-primary/20 text-center">
              <span className="text-[10px] text-muted-foreground block font-medium">Composite APPI</span>
              <span className="text-sm font-black text-primary">{globalSummary.avgAppiScore}</span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-chart-2/10 border border-chart-2/20 text-center">
              <span className="text-[10px] text-muted-foreground block font-medium">Essentials</span>
              <span className="text-sm font-black text-chart-2">{globalSummary.avgAppiEssentials}</span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-chart-4/10 border border-chart-4/20 text-center">
              <span className="text-[10px] text-muted-foreground block font-medium">Luxury</span>
              <span className="text-sm font-black text-chart-4">{globalSummary.avgAppiLuxury}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-background/60 border border-border/60">
            <span className="text-muted-foreground flex items-center gap-1 mb-1 font-semibold">
              <Utensils className="size-3 text-primary" /> Food Basket (Mo.)
            </span>
            <div className="text-base font-extrabold text-foreground">${globalSummary.avgBasketCostUSD.toFixed(1)}</div>
            <div className="text-[11px] text-muted-foreground">{globalSummary.avgLaborHoursFood.toFixed(1)}h ({globalSummary.avgBasketPercentOfWage.toFixed(1)}% of wage)</div>
          </div>

          <div className="p-3 rounded-xl bg-background/60 border border-border/60">
            <span className="text-muted-foreground flex items-center gap-1 mb-1 font-semibold">
              <Home className="size-3 text-chart-2" /> 1-BR Rent (Mo.)
            </span>
            <div className="text-base font-extrabold text-foreground">${globalSummary.avgRentUSD.toFixed(1)}</div>
            <div className="text-[11px] text-muted-foreground">{globalSummary.avgRentLaborHours.toFixed(1)}h ({globalSummary.avgRentPercentOfWage.toFixed(1)}% of wage)</div>
          </div>

          <div className="p-3 rounded-xl bg-background/60 border border-border/60">
            <span className="text-muted-foreground flex items-center gap-1 mb-1 font-semibold">
              <Car className="size-3 text-chart-4" /> Standard Car
            </span>
            <div className="text-base font-extrabold text-foreground">${globalSummary.avgCarPriceUSD.toFixed(0)}</div>
            <div className="text-[11px] text-muted-foreground">{globalSummary.avgCarLaborMonths.toFixed(1)} months of work</div>
          </div>

          <div className="p-3 rounded-xl bg-background/60 border border-border/60">
            <span className="text-muted-foreground flex items-center gap-1 mb-1 font-semibold">
              <Stethoscope className="size-3 text-rose-500" /> Medical Checkup
            </span>
            <div className="text-base font-extrabold text-foreground">${globalSummary.avgMedicalCheckupUSD.toFixed(1)}</div>
            <div className="text-[11px] text-muted-foreground">{globalSummary.avgMedicalCheckupLaborHours.toFixed(1)}h ({globalSummary.avgMedicalCheckupPercentOfWage.toFixed(1)}% of wage)</div>
          </div>
        </div>
      </div>

      {/* Aggregate KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-border/80 bg-card/60 backdrop-blur p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Filtered Food Effort</span>
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-extrabold text-foreground">{formatHours(filteredStats.avgFoodHours)}</div>
            <div className="text-xs text-muted-foreground">≈ {formatPercent(filteredStats.avgFoodPercent)} of median monthly wage</div>
          </div>
          <span className="text-[10px] text-muted-foreground">Global Avg: {formatHours(globalSummary.avgLaborHoursFood)}</span>
        </Card>

        <Card className="border-border/80 bg-card/60 backdrop-blur p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Top Food Power</span>
            <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <TrendingDown className="size-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-500">
              {globalSummary.bestFoodCountry.flag} {globalSummary.bestFoodCountry.name}
            </div>
            <div className="text-xs text-muted-foreground">
              Only {formatHours(globalSummary.bestFoodCountry.laborHoursForBasket)} ({formatPercent(globalSummary.bestFoodCountry.basketPercentOfWage)})
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground">Top global APPI rank #{globalSummary.bestFoodCountry.rank}</span>
        </Card>

        <Card className="border-border/80 bg-card/60 backdrop-blur p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Top Rent Affordability</span>
            <div className="size-8 rounded-lg bg-chart-2/10 flex items-center justify-center text-chart-2">
              <Home className="size-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-extrabold text-chart-2">
              {globalSummary.bestRentCountry.flag} {globalSummary.bestRentCountry.name}
            </div>
            <div className="text-xs text-muted-foreground">
              Rent is {formatPercent(globalSummary.bestRentCountry.rentPercentOfWage)} of median wage (${globalSummary.bestRentCountry.rentMonthlyUSD.toFixed(0)}/mo)
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground">Top Housing Purchasing Power</span>
        </Card>

        <Card className="border-border/80 bg-card/60 backdrop-blur p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Top Vehicle Purchasing</span>
            <div className="size-8 rounded-lg bg-chart-4/10 flex items-center justify-center text-chart-4">
              <Car className="size-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-extrabold text-foreground">
              {globalSummary.bestCarCountry.flag} {globalSummary.bestCarCountry.name}
            </div>
            <div className="text-xs text-muted-foreground">{globalSummary.bestCarCountry.carLaborMonths.toFixed(1)} months of median wage</div>
          </div>
          <span className="text-[10px] text-muted-foreground">Fastest labor accumulation for new car</span>
        </Card>
      </div>

      {/* Filter and View Controls */}
      <Card className="border-border/80 bg-card/70 backdrop-blur p-4 sm:p-5 shadow-sm relative z-30 overflow-visible">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Continent Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {continents.map((cont) => (
              <Button
                key={cont}
                variant={selectedContinent === cont ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedContinent(cont)}
                className="text-xs whitespace-nowrap rounded-lg h-8"
              >
                {cont}
              </Button>
            ))}
          </div>

          {/* Tier Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="w-full sm:w-[170px]">
              <SearchableSelect
                options={tierFilterOptions}
                value={selectedTier}
                onChange={setSelectedTier}
                placeholder="Stress Tier..."
                searchPlaceholder="Search tier..."
                size="sm"
                ariaLabel="Filter by Stress Tier"
              />
            </div>

            <div className="relative flex-1 sm:min-w-[180px]">
              <Search className="size-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-full rounded-xl border border-input bg-background pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Interactive Visualizations Panel */}
      <Card className="border-border/80 bg-card/60 backdrop-blur shadow-lg">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="size-5 text-primary" />
              <span>Interactive Multi-Pillar Visualizations</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Showing {filteredCountries.length} countries matching active filters
            </CardDescription>
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1 overflow-x-auto max-w-full scrollbar-none">
            <Button
              variant={activeChartTab === "food" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveChartTab("food")}
              className="text-xs h-7 px-2.5 gap-1 shrink-0 rounded-lg"
            >
              <Utensils className="size-3" />
              <span>Food Labor</span>
            </Button>
            <Button
              variant={activeChartTab === "rent" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveChartTab("rent")}
              className="text-xs h-7 px-2.5 gap-1 shrink-0 rounded-lg"
            >
              <Home className="size-3" />
              <span>1-BR Rent</span>
            </Button>
            <Button
              variant={activeChartTab === "car" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveChartTab("car")}
              className="text-xs h-7 px-2.5 gap-1 shrink-0 rounded-lg"
            >
              <Car className="size-3" />
              <span>Car (Months)</span>
            </Button>
            <Button
              variant={activeChartTab === "medical" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveChartTab("medical")}
              className="text-xs h-7 px-2.5 gap-1 shrink-0 rounded-lg"
            >
              <Stethoscope className="size-3" />
              <span>Medical Exam</span>
            </Button>
            <Button
              variant={activeChartTab === "categories" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveChartTab("categories")}
              className="text-xs h-7 px-2.5 gap-1 shrink-0 rounded-lg"
            >
              <Layers className="size-3" />
              <span>Categories</span>
            </Button>
            <Button
              variant={activeChartTab === "scatter" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveChartTab("scatter")}
              className="text-xs h-7 px-2.5 gap-1 shrink-0 rounded-lg"
            >
              <BarChart3 className="size-3" />
              <span>Wage vs Cost</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* TAB 1: Food Labor Hours Bar Chart */}
          {activeChartTab === "food" && (
            <div className="flex flex-col gap-4">
              <div className="h-[420px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredCountries.map((c) => ({
                      name: `${c.flag} ${c.name}`,
                      code: c.code,
                      hours: parseFloat(c.laborHoursForBasket.toFixed(1)),
                      percent: parseFloat(c.basketPercentOfWage.toFixed(1)),
                      tier: c.stressTier,
                    }))}
                    margin={{ top: 10, right: 10, left: -10, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                    <XAxis
                      dataKey="code"
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      unit="h"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="rounded-lg border border-border/80 bg-popover p-3 shadow-md text-xs">
                              <div className="font-bold text-popover-foreground mb-1.5">{item.name}</div>
                              <div className="flex justify-between gap-4 text-muted-foreground">
                                <span>Labor Required:</span>
                                <span className="font-semibold text-primary">{item.hours} hours</span>
                              </div>
                              <div className="flex justify-between gap-4 text-muted-foreground">
                                <span>Wage Share:</span>
                                <span className="font-semibold text-foreground">{item.percent}%</span>
                              </div>
                              <div className="flex justify-between gap-4 text-muted-foreground mt-1 pt-1 border-t border-border/40">
                                <span>Stress Tier:</span>
                                <span className="font-semibold">{item.tier}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                      {filteredCountries.map((c, idx) => (
                        <Cell
                          key={`food-bar-${idx}`}
                          fill={
                            c.stressTier === "Low"
                              ? "hsl(var(--success))"
                              : c.stressTier === "Moderate"
                              ? "hsl(var(--chart-3))"
                              : c.stressTier === "High"
                              ? "hsl(var(--chart-5))"
                              : "hsl(var(--destructive))"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Labor hours required for monthly food basket. Global Average: <strong>{globalSummary.avgLaborHoursFood.toFixed(1)}h</strong>.
              </div>
            </div>
          )}

          {/* TAB 2: Housing Rent Labor Hours Bar Chart */}
          {activeChartTab === "rent" && (
            <div className="flex flex-col gap-4">
              <div className="h-[420px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredCountries.map((c) => ({
                      name: `${c.flag} ${c.name}`,
                      code: c.code,
                      hours: parseFloat(c.rentLaborHours.toFixed(1)),
                      percent: parseFloat(c.rentPercentOfWage.toFixed(1)),
                      usd: Math.round(c.rentMonthlyUSD),
                    }))}
                    margin={{ top: 10, right: 10, left: -10, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                    <XAxis
                      dataKey="code"
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      unit="h"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="rounded-lg border border-border/80 bg-popover p-3 shadow-md text-xs">
                              <div className="font-bold text-popover-foreground mb-1.5">{item.name}</div>
                              <div className="flex justify-between gap-4 text-muted-foreground">
                                <span>Monthly 1-BR Rent:</span>
                                <span className="font-semibold text-foreground">${item.usd}/mo</span>
                              </div>
                              <div className="flex justify-between gap-4 text-muted-foreground">
                                <span>Labor Hours:</span>
                                <span className="font-semibold text-primary">{item.hours} hours</span>
                              </div>
                              <div className="flex justify-between gap-4 text-muted-foreground">
                                <span>Share of Median Wage:</span>
                                <span className="font-semibold text-foreground">{item.percent}%</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="hours" radius={[4, 4, 0, 0]} fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Labor hours required for 1-Bedroom apartment monthly rent. Global Average: <strong>${globalSummary.avgRentUSD.toFixed(0)}/mo ({globalSummary.avgRentLaborHours.toFixed(1)}h)</strong>.
              </div>
            </div>
          )}

          {/* TAB 3: Car Purchase (Labor Months) Bar Chart */}
          {activeChartTab === "car" && (
            <div className="flex flex-col gap-4">
              <div className="h-[420px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredCountries.map((c) => ({
                      name: `${c.flag} ${c.name}`,
                      code: c.code,
                      months: parseFloat(c.carLaborMonths.toFixed(1)),
                      usd: Math.round(c.carPriceUSD),
                    }))}
                    margin={{ top: 10, right: 10, left: -10, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                    <XAxis
                      dataKey="code"
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      unit=" mo"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="rounded-lg border border-border/80 bg-popover p-3 shadow-md text-xs">
                              <div className="font-bold text-popover-foreground mb-1.5">{item.name}</div>
                              <div className="flex justify-between gap-4 text-muted-foreground">
                                <span>Vehicle Retail Price:</span>
                                <span className="font-semibold text-foreground">${item.usd}</span>
                              </div>
                              <div className="flex justify-between gap-4 text-muted-foreground">
                                <span>Labor Months Required:</span>
                                <span className="font-semibold text-primary">{item.months} months</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="months" radius={[4, 4, 0, 0]} fill="hsl(var(--chart-4))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Months of 100% median labor required to purchase a standard new passenger car. Global Average: <strong>{globalSummary.avgCarLaborMonths.toFixed(1)} months (${globalSummary.avgCarPriceUSD.toFixed(0)})</strong>.
              </div>
            </div>
          )}

          {/* TAB 4: Medical Checkup Labor Hours Bar Chart */}
          {activeChartTab === "medical" && (
            <div className="flex flex-col gap-4">
              <div className="h-[420px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredCountries.map((c) => ({
                      name: `${c.flag} ${c.name}`,
                      code: c.code,
                      hours: parseFloat(c.medicalCheckupLaborHours.toFixed(1)),
                      percent: parseFloat(c.medicalCheckupPercentOfWage.toFixed(1)),
                      usd: Math.round(c.medicalCheckupUSD),
                    }))}
                    margin={{ top: 10, right: 10, left: -10, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                    <XAxis
                      dataKey="code"
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      unit="h"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="rounded-lg border border-border/80 bg-popover p-3 shadow-md text-xs">
                              <div className="font-bold text-popover-foreground mb-1.5">{item.name}</div>
                              <div className="flex justify-between gap-4 text-muted-foreground">
                                <span>Checkup & Lab Exam Cost:</span>
                                <span className="font-semibold text-foreground">${item.usd}</span>
                              </div>
                              <div className="flex justify-between gap-4 text-muted-foreground">
                                <span>Labor Hours Required:</span>
                                <span className="font-semibold text-primary">{item.hours} hours</span>
                              </div>
                              <div className="flex justify-between gap-4 text-muted-foreground">
                                <span>Share of Median Wage:</span>
                                <span className="font-semibold text-foreground">{item.percent}%</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="hours" radius={[4, 4, 0, 0]} fill="hsl(var(--chart-5))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Labor hours required for a routine preventive medical checkup (doctor consultation + CBC + lipid + metabolic panel). Global Average: <strong>${globalSummary.avgMedicalCheckupUSD.toFixed(1)} ({globalSummary.avgMedicalCheckupLaborHours.toFixed(1)}h)</strong>.
              </div>
            </div>
          )}

          {/* TAB 5: Food Category Stacked Bar Chart */}
          {activeChartTab === "categories" && (
            <div className="flex flex-col gap-4">
              <div className="h-[420px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -10, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      unit="h"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border border-border/80 bg-popover p-3 shadow-md text-xs">
                              <div className="font-bold text-popover-foreground mb-2">{data.fullName}</div>
                              <div className="flex justify-between gap-4 text-muted-foreground">
                                <span>🌾 Staples (Rice, Bread, Potatoes, Beans):</span>
                                <span className="font-semibold text-foreground">{data.staples}h</span>
                              </div>
                              <div className="flex justify-between gap-4 text-muted-foreground">
                                <span>🥩 Meat & Poultry:</span>
                                <span className="font-semibold text-foreground">{data.meat}h</span>
                              </div>
                              <div className="flex justify-between gap-4 text-muted-foreground">
                                <span>🥛 Dairy & Eggs:</span>
                                <span className="font-semibold text-foreground">{data.dairy}h</span>
                              </div>
                              <div className="flex justify-between gap-4 text-muted-foreground">
                                <span>🥦 Fresh Produce:</span>
                                <span className="font-semibold text-foreground">{data.produce}h</span>
                              </div>
                              <div className="flex justify-between gap-4 text-muted-foreground">
                                <span>🫒 Cooking Oil:</span>
                                <span className="font-semibold text-foreground">{data.oil}h</span>
                              </div>
                              <div className="flex justify-between gap-4 font-bold text-primary mt-2 pt-2 border-t border-border/40">
                                <span>Total Labor Hours:</span>
                                <span>{data.totalHours}h</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                    <Bar dataKey="staples" name="Staples & Grains" stackId="a" fill="hsl(var(--chart-1))" />
                    <Bar dataKey="meat" name="Meat & Poultry" stackId="a" fill="hsl(var(--chart-5))" />
                    <Bar dataKey="dairy" name="Dairy & Eggs" stackId="a" fill="hsl(var(--chart-4))" />
                    <Bar dataKey="produce" name="Fresh Produce" stackId="a" fill="hsl(var(--chart-2))" />
                    <Bar dataKey="oil" name="Cooking Oils" stackId="a" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Decomposition of monthly labor hours into nutritional categories (Staples, Meat, Dairy, Produce, Oils).
              </div>
            </div>
          )}

          {/* TAB 6: Wage vs Basket Scatter Plot */}
          {activeChartTab === "scatter" && (
            <div className="flex flex-col gap-4">
              <div className="h-[420px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                    <XAxis
                      type="number"
                      dataKey="wageUSD"
                      name="Monthly Median Wage"
                      unit="$"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      label={{
                        value: "Monthly Median Take-Home Wage ($ USD)",
                        position: "insideBottom",
                        offset: -10,
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      type="number"
                      dataKey="basketUSD"
                      name="Monthly Food Basket Cost"
                      unit="$"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      label={{
                        value: "Food Basket Cost ($ USD)",
                        angle: -90,
                        position: "insideLeft",
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 12,
                      }}
                    />
                    <ZAxis type="number" dataKey="laborHours" range={[60, 300]} name="Labor Hours" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border border-border/80 bg-popover p-3 shadow-md text-xs">
                              <div className="font-bold text-popover-foreground mb-1">{data.name}</div>
                              <div className="text-muted-foreground">Region: {data.continent}</div>
                              <div className="flex justify-between gap-4 text-muted-foreground mt-1">
                                <span>Median Wage:</span>
                                <span className="font-semibold text-foreground">${data.wageUSD}/mo</span>
                              </div>
                              <div className="flex justify-between gap-4 text-muted-foreground">
                                <span>Food Basket:</span>
                                <span className="font-semibold text-foreground">${data.basketUSD}/mo</span>
                              </div>
                              <div className="flex justify-between gap-4 text-muted-foreground">
                                <span>1-BR Rent:</span>
                                <span className="font-semibold text-foreground">${data.rentUSD}/mo</span>
                              </div>
                              <div className="flex justify-between gap-4 text-muted-foreground">
                                <span>Car Purchase:</span>
                                <span className="font-semibold text-foreground">${data.carPriceUSD}</span>
                              </div>
                              <div className="flex justify-between gap-4 text-muted-foreground">
                                <span>Medical Exam:</span>
                                <span className="font-semibold text-foreground">${data.medicalUSD}</span>
                              </div>
                              <div className="flex justify-between gap-4 text-muted-foreground pt-1 border-t border-border/40">
                                <span>Food Labor:</span>
                                <span className="font-semibold text-primary">{data.laborHours}h ({data.wagePercent}%)</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter name="Countries" data={scatterData} fill="hsl(var(--primary))">
                      {scatterData.map((entry, index) => (
                        <Cell
                          key={`scatter-cell-${index}`}
                          fill={
                            entry.tier === "Low"
                              ? "hsl(var(--success))"
                              : entry.tier === "Moderate"
                              ? "hsl(var(--chart-3))"
                              : entry.tier === "High"
                              ? "hsl(var(--chart-5))"
                              : "hsl(var(--destructive))"
                          }
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Scatter analysis: Bubble size corresponds to total labor hours needed to afford food.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
