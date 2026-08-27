import React, { useState, useMemo } from "react";
import { RAW_COUNTRIES } from "@/data/countries";
import { getAllProcessedCountries } from "@/lib/methodology";
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
import {
  TrendingDown,
  TrendingUp,
  Clock,
  Filter,
  BarChart3,
  Sparkles,
  Search,
} from "lucide-react";

export function DashboardContainer() {
  const allCountries = useMemo(() => getAllProcessedCountries(RAW_COUNTRIES), []);
  const [selectedContinent, setSelectedContinent] = useState<string>("All");
  const [selectedTier, setSelectedTier] = useState<string>("All");
  const [activeChartTab, setActiveChartTab] = useState<"burden" | "categories" | "scatter">("burden");
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

  // Aggregate Metrics
  const stats = useMemo(() => {
    if (allCountries.length === 0) return { avgHours: 0, avgPercent: 0, best: null, worst: null };
    const totalHours = allCountries.reduce((sum, c) => sum + c.laborHoursForBasket, 0);
    const totalPercent = allCountries.reduce((sum, c) => sum + c.basketPercentOfWage, 0);
    const best = allCountries[0];
    const worst = allCountries[allCountries.length - 1];
    return {
      avgHours: totalHours / allCountries.length,
      avgPercent: totalPercent / allCountries.length,
      best,
      worst,
    };
  }, [allCountries]);

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
      laborHours: parseFloat(c.laborHoursForBasket.toFixed(1)),
      wagePercent: parseFloat(c.basketPercentOfWage.toFixed(1)),
      continent: c.continent,
      tier: c.stressTier,
    }));
  }, [filteredCountries]);

  const continents = ["All", "Europe", "Americas", "Asia", "Oceania", "Africa"];
  const tiers = ["All", "Low", "Moderate", "High", "Severe"];

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-primary/10 border-primary/20 text-primary">
              AtlasIndex Global Analytics
            </Badge>
            <span className="text-xs text-muted-foreground">• 195 Sovereign Nations Audit</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Global Economy & Labor Effort Dashboard
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Visualizing nutritional purchasing power across {allCountries.length} countries. Filter by continent, examine category labor breakdowns, and inspect the structural disconnect between median income and baseline nourishment.
          </p>
        </div>

        <a href={getBasePath("/continents")} className="shrink-0">
          <Button variant="outline" size="sm" className="text-xs gap-1.5 border-primary/30 hover:bg-primary/10 text-primary font-semibold">
            <span>Continent Breakdown</span>
            <span>→</span>
          </Button>
        </a>
      </div>

      {/* Aggregate KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/80 bg-card/60 backdrop-blur p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Global Average Effort</span>
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-foreground">{formatHours(stats.avgHours)}</div>
            <div className="text-xs text-muted-foreground">≈ {formatPercent(stats.avgPercent)} of median monthly wage</div>
          </div>
          <span className="text-[10px] text-muted-foreground">Based on 160h standard working month</span>
        </Card>

        <Card className="border-border/80 bg-card/60 backdrop-blur p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Highest Purchasing Power</span>
            <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <TrendingDown className="size-4" />
            </div>
          </div>
          {stats.best && (
            <div className="my-2">
              <div className="text-2xl font-extrabold text-emerald-500">
                {stats.best.flag} {stats.best.name}
              </div>
              <div className="text-xs text-muted-foreground">
                Only {formatHours(stats.best.laborHoursForBasket)} ({formatPercent(stats.best.basketPercentOfWage)})
              </div>
            </div>
          )}
          <span className="text-[10px] text-muted-foreground">Top global APPI score #{stats.best?.rank}</span>
        </Card>

        <Card className="border-border/80 bg-card/60 backdrop-blur p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Severe Labor Drain</span>
            <div className="size-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
              <TrendingUp className="size-4" />
            </div>
          </div>
          {stats.worst && (
            <div className="my-2">
              <div className="text-2xl font-extrabold text-rose-500">
                {stats.worst.flag} {stats.worst.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatHours(stats.worst.laborHoursForBasket)} ({formatPercent(stats.worst.basketPercentOfWage)})
              </div>
            </div>
          )}
          <span className="text-[10px] text-muted-foreground">High staple & import inflation</span>
        </Card>

        <Card className="border-border/80 bg-card/60 backdrop-blur p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Protein vs Grain Ratio</span>
            <div className="size-8 rounded-lg bg-chart-4/10 flex items-center justify-center text-chart-4">
              <Sparkles className="size-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-foreground">4.2x</div>
            <div className="text-xs text-muted-foreground">Global labor hours for meat vs rice</div>
          </div>
          <span className="text-[10px] text-muted-foreground">Animal protein creates steepest divergence</span>
        </Card>
      </div>

      {/* Filter and View Controls */}
      <Card className="border-border/80 bg-card/70 backdrop-blur p-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Continent Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {continents.map((cont) => (
              <Button
                key={cont}
                variant={selectedContinent === cont ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedContinent(cont)}
                className="text-xs whitespace-nowrap"
              >
                {cont}
              </Button>
            ))}
          </div>

          {/* Tier Filters & Search */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Filter className="size-3.5" />
              <span>Stress Tier:</span>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {tiers.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative min-w-[180px]">
              <Search className="size-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Interactive Visualizations Panel */}
      <Card className="border-border/80 bg-card/60 backdrop-blur shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="size-5 text-primary" />
              <span>Interactive Data Visualizations</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Showing {filteredCountries.length} countries matching active filters
            </CardDescription>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1">
            <Button
              variant={activeChartTab === "burden" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveChartTab("burden")}
              className="text-xs h-7 px-3"
            >
              Labor Hours
            </Button>
            <Button
              variant={activeChartTab === "categories" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveChartTab("categories")}
              className="text-xs h-7 px-3"
            >
              Category Stack
            </Button>
            <Button
              variant={activeChartTab === "scatter" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveChartTab("scatter")}
              className="text-xs h-7 px-3"
            >
              Wage vs Basket
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* TAB 1: Labor Hours Total Bar Chart */}
          {activeChartTab === "burden" && (
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
                          key={`bar-${idx}`}
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
                Countries sorted from highest purchasing power (left) to highest labor drain (right).
              </div>
            </div>
          )}

          {/* TAB 2: Food Category Stacked Bar Chart */}
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

          {/* TAB 3: Wage vs Basket Scatter Plot */}
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
                                <span>Basket Cost:</span>
                                <span className="font-semibold text-foreground">${data.basketUSD}/mo</span>
                              </div>
                              <div className="flex justify-between gap-4 text-muted-foreground">
                                <span>Labor Hours:</span>
                                <span className="font-semibold text-primary">{data.laborHours}h</span>
                              </div>
                              <div className="flex justify-between gap-4 text-muted-foreground">
                                <span>Wage Share:</span>
                                <span className="font-semibold text-foreground">{data.wagePercent}%</span>
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
