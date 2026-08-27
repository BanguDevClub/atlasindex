import React, { useState, useEffect, useMemo } from "react";
import { RAW_COUNTRIES } from "@/data/countries";
import { getAllProcessedCountries, getWorldAverageCountry } from "@/lib/methodology";
import type { ProcessedCountryEconomy } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatHours, formatMinutes, formatPercent } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  Plus,
  X,
  Clock,
  Sliders,
  Utensils,
  Home,
  Car,
  Stethoscope,
  Layers,
} from "lucide-react";

export function CountryComparator() {
  const allCountries = useMemo(() => getAllProcessedCountries(RAW_COUNTRIES), []);
  const worldAvgCountry = useMemo(() => getWorldAverageCountry(allCountries), [allCountries]);

  // Combine actual countries and virtual World Average
  const selectableCountries = useMemo(() => {
    return [worldAvgCountry, ...allCountries];
  }, [worldAvgCountry, allCountries]);

  const [selectedIds, setSelectedIds] = useState<string[]>(["usa", "brazil", "germany", "world-average"]);
  const [simulatorWageUSD, setSimulatorWageUSD] = useState<number>(3500);
  const [chartMode, setChartMode] = useState<"pillars" | "items" | "categories">("pillars");

  // Initialize from URL search params if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const c1 = params.get("c1");
      const c2 = params.get("c2");
      const c3 = params.get("c3");
      const c4 = params.get("c4");
      const list = [c1, c2, c3, c4].filter(Boolean) as string[];
      if (list.length >= 2) {
        setSelectedIds(list);
      }
    }
  }, []);

  const selectedCountries: ProcessedCountryEconomy[] = useMemo(() => {
    return selectedIds
      .map((id) => selectableCountries.find((c) => c.id === id))
      .filter(Boolean) as ProcessedCountryEconomy[];
  }, [selectableCountries, selectedIds]);

  const addCountry = (id: string) => {
    if (!selectedIds.includes(id) && selectedIds.length < 4) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const removeCountry = (id: string) => {
    if (selectedIds.length > 2) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    }
  };

  const changeCountry = (index: number, newId: string) => {
    const updated = [...selectedIds];
    updated[index] = newId;
    setSelectedIds(updated);
  };

  // 4 Living Pillars Comparison Data
  const pillarsComparisonData = useMemo(() => {
    const pillars = [
      { key: "food", name: "Food Basket (hrs)" },
      { key: "rent", name: "1-BR Rent (hrs)" },
      { key: "medical", name: "Medical Exam (hrs)" },
      { key: "car", name: "Car (Labor Months)" },
    ];

    return pillars.map((p) => {
      const entry: any = { pillar: p.name };
      selectedCountries.forEach((c) => {
        if (p.key === "food") entry[c.name] = parseFloat(c.laborHoursForBasket.toFixed(1));
        else if (p.key === "rent") entry[c.name] = parseFloat(c.rentLaborHours.toFixed(1));
        else if (p.key === "medical") entry[c.name] = parseFloat(c.medicalCheckupLaborHours.toFixed(1));
        else if (p.key === "car") entry[c.name] = parseFloat(c.carLaborMonths.toFixed(1));
      });
      return entry;
    });
  }, [selectedCountries]);

  // Category comparison data
  const categoryComparisonData = useMemo(() => {
    const categories = [
      { key: "staples", name: "Staples & Grains" },
      { key: "meat", name: "Meat & Poultry" },
      { key: "dairy", name: "Dairy & Eggs" },
      { key: "produce", name: "Fresh Produce" },
      { key: "oil", name: "Cooking Oils" },
    ];

    return categories.map((cat) => {
      const entry: any = { category: cat.name };
      selectedCountries.forEach((c) => {
        const hours = (c.categoryLaborHours as any)[cat.key] || 0;
        entry[c.name] = parseFloat(hours.toFixed(1));
      });
      return entry;
    });
  }, [selectedCountries]);

  // Item Labor Minutes comparison data
  const itemComparisonData = useMemo(() => {
    const keyItems = ["rice", "beef", "chicken", "eggs", "milk", "bread", "potatoes", "oil"];
    return keyItems.map((itemId) => {
      const sampleItem = selectedCountries[0]?.items.find((i) => i.itemId === itemId);
      const entry: any = { item: sampleItem ? sampleItem.name.split(" ")[0] : itemId };
      selectedCountries.forEach((c) => {
        const item = c.items.find((i) => i.itemId === itemId);
        entry[c.name] = item ? parseFloat(item.minutesOfWorkPerUnit.toFixed(1)) : 0;
      });
      return entry;
    });
  }, [selectedCountries]);

  const paletteColors = [
    "hsl(var(--primary))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  const tierBadgeVariant = (tier?: string) => {
    switch (tier) {
      case "Low": return "tierLow";
      case "Moderate": return "tierModerate";
      case "High": return "tierHigh";
      default: return "tierSevere";
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-primary/10 border-primary/20 text-primary">
            Head-to-Head Multi-Pillar Analysis
          </Badge>
          <span className="text-xs text-muted-foreground">• Compare 2 to 4 Economies vs Global Average</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Side-by-Side Living Cost & Labor Effort Comparator
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Contrast median purchasing power across <strong>Food, Housing (1-BR Rent), Transport (New Car), and Healthcare (Medical Exams)</strong> directly against the <strong>Global Average baseline</strong>.
        </p>
      </div>

      {/* Country Selectors Bar */}
      <Card className="border-border/80 bg-card/70 backdrop-blur p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {selectedIds.map((id, idx) => (
              <div key={idx} className="flex items-center gap-1.5 bg-background/80 rounded-lg border border-border/80 p-1.5">
                <select
                  value={id}
                  onChange={(e) => changeCountry(idx, e.target.value)}
                  className="h-8 bg-transparent text-xs font-semibold focus:outline-none pr-2"
                >
                  {selectableCountries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.flag} {c.name} {c.id === "world-average" ? "(Benchmark)" : ""}
                    </option>
                  ))}
                </select>
                {selectedIds.length > 2 && (
                  <button
                    onClick={() => removeCountry(id)}
                    className="size-6 rounded hover:bg-muted text-muted-foreground hover:text-destructive flex items-center justify-center"
                    title="Remove country"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            ))}

            {selectedIds.length < 4 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const available = selectableCountries.find((c) => !selectedIds.includes(c.id));
                  if (available) addCountry(available.id);
                }}
                className="text-xs h-9 gap-1"
              >
                <Plus className="size-3.5" />
                <span>Add Country</span>
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            Comparing <span className="font-semibold text-foreground">{selectedCountries.length}</span> entities
          </div>
        </div>
      </Card>

      {/* Econometric Estimation Notice if any selected country is estimated */}
      {selectedCountries.some((c) => c.isEstimated) && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-700 dark:text-amber-300 space-y-2">
          <div className="font-bold flex items-center gap-2 text-sm">
            <span>⚠️ Econometric Data Estimation Notice</span>
          </div>
          <div className="space-y-1 text-xs">
            {selectedCountries
              .filter((c) => c.isEstimated)
              .map((c) => (
                <p key={c.id}>
                  <strong>{c.flag} {c.name}:</strong> {c.estimationDisclaimer || "Data is estimated based on regional purchasing power models."}
                </p>
              ))}
          </div>
        </div>
      )}

      {/* Side-by-Side Scorecards Grid */}
      <div
        className={`grid grid-cols-1 gap-4 ${
          selectedCountries.length === 2
            ? "sm:grid-cols-2"
            : selectedCountries.length === 3
            ? "sm:grid-cols-3"
            : "sm:grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {selectedCountries.map((country, index) => (
          <Card
            key={country.id}
            className="border-border/80 bg-card/60 backdrop-blur shadow-md flex flex-col justify-between overflow-hidden relative"
          >
            <div
              className="h-1.5 w-full"
              style={{ backgroundColor: paletteColors[index % paletteColors.length] }}
            />
            <CardHeader className="pb-3 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{country.flag}</span>
                <div className="flex items-center gap-1">
                  {country.id === "world-average" ? (
                    <Badge variant="outline" className="text-[10px] bg-primary/20 border-primary/30 text-primary font-bold">
                      World Benchmark
                    </Badge>
                  ) : country.isEstimated ? (
                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 border-amber-500/30 text-amber-500 font-semibold">
                      Estimated
                    </Badge>
                  ) : (
                    <Badge variant={tierBadgeVariant(country.stressTier)} className="text-xs">
                      {country.stressTier} Stress
                    </Badge>
                  )}
                </div>
              </div>
              <CardTitle className="text-lg font-bold mt-2">{country.name}</CardTitle>
              <CardDescription className="text-xs">
                {country.id === "world-average" ? "195 Sovereign Nations Synthesis" : `${country.continent} • Rank #${country.rank}`}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-2.5 text-xs pt-0">
              <div className="flex justify-between items-center py-1 border-b border-border/40 font-semibold">
                <span className="text-muted-foreground">Monthly Median Wage:</span>
                <span className="text-foreground">
                  ${country.monthlyMedianWageUSD.toFixed(0)}/mo
                </span>
              </div>

              {/* Pillar 1: Food Basket */}
              <div className="p-2 rounded-lg bg-background/50 border border-border/40">
                <div className="flex justify-between items-center text-[11px] font-semibold text-primary mb-1">
                  <span className="flex items-center gap-1"><Utensils className="size-3" /> Food Basket (Mo.)</span>
                  <span>${country.monthlyBasketCostUSD.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Effort: {formatHours(country.laborHoursForBasket)}</span>
                  <span>Share: <strong>{formatPercent(country.basketPercentOfWage)}</strong></span>
                </div>
              </div>

              {/* Pillar 2: Housing Rent */}
              <div className="p-2 rounded-lg bg-background/50 border border-border/40">
                <div className="flex justify-between items-center text-[11px] font-semibold text-chart-2 mb-1">
                  <span className="flex items-center gap-1"><Home className="size-3" /> 1-BR Apartment Rent</span>
                  <span>${country.rentMonthlyUSD.toFixed(0)}/mo</span>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Effort: {formatHours(country.rentLaborHours)}</span>
                  <span>Share: <strong>{formatPercent(country.rentPercentOfWage)}</strong></span>
                </div>
              </div>

              {/* Pillar 3: Vehicle Purchase */}
              <div className="p-2 rounded-lg bg-background/50 border border-border/40">
                <div className="flex justify-between items-center text-[11px] font-semibold text-chart-4 mb-1">
                  <span className="flex items-center gap-1"><Car className="size-3" /> Standard Passenger Car</span>
                  <span>${country.carPriceUSD.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Labor Effort:</span>
                  <span><strong>{country.carLaborMonths.toFixed(1)} months</strong> of wage</span>
                </div>
              </div>

              {/* Pillar 4: Medical Checkup */}
              <div className="p-2 rounded-lg bg-background/50 border border-border/40">
                <div className="flex justify-between items-center text-[11px] font-semibold text-rose-500 mb-1">
                  <span className="flex items-center gap-1"><Stethoscope className="size-3" /> Medical Checkup Exam</span>
                  <span>${country.medicalCheckupUSD.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Effort: {formatHours(country.medicalCheckupLaborHours)}</span>
                  <span>Share: <strong>{formatPercent(country.medicalCheckupPercentOfWage)}</strong></span>
                </div>
              </div>

              <div className="flex justify-between items-center py-1 mt-1 pt-1.5 border-t border-border/40">
                <span className="text-muted-foreground font-semibold">APPI Score:</span>
                <span className="font-bold text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {country.appiScore} / 100
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visual Comparison Charts */}
      <Card className="border-border/80 bg-card/60 backdrop-blur shadow-md">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              <span>Comparative Multi-Pillar Visualizations</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Contrast living burdens across selected economies
            </CardDescription>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1">
            <Button
              variant={chartMode === "pillars" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartMode("pillars")}
              className="text-xs h-7 px-3"
            >
              4 Living Pillars
            </Button>
            <Button
              variant={chartMode === "items" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartMode("items")}
              className="text-xs h-7 px-3"
            >
              Food Items (Minutes)
            </Button>
            <Button
              variant={chartMode === "categories" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartMode("categories")}
              className="text-xs h-7 px-3"
            >
              Food Categories
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {chartMode === "pillars" && (
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pillarsComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                  <XAxis dataKey="pillar" tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border border-border/80 bg-popover p-2.5 shadow-md text-xs">
                            <div className="font-bold text-popover-foreground mb-1">{label}</div>
                            {payload.map((entry: any, i: number) => (
                              <div key={i} className="flex justify-between gap-4 text-muted-foreground">
                                <span style={{ color: entry.color }}>{entry.name}:</span>
                                <span className="font-semibold text-foreground">
                                  {label && String(label).includes("Months") ? `${entry.value} months` : `${entry.value}h`}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                  {selectedCountries.map((c, idx) => (
                    <Bar
                      key={c.id}
                      dataKey={c.name}
                      fill={paletteColors[idx % paletteColors.length]}
                      radius={[3, 3, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartMode === "items" && (
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={itemComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                  <XAxis dataKey="item" tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} unit="m" />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border border-border/80 bg-popover p-2.5 shadow-md text-xs">
                            <div className="font-bold text-popover-foreground mb-1">{label}</div>
                            {payload.map((entry: any, i: number) => (
                              <div key={i} className="flex justify-between gap-4 text-muted-foreground">
                                <span style={{ color: entry.color }}>{entry.name}:</span>
                                <span className="font-semibold text-foreground">{formatMinutes(entry.value)}</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                  {selectedCountries.map((c, idx) => (
                    <Bar
                      key={c.id}
                      dataKey={c.name}
                      fill={paletteColors[idx % paletteColors.length]}
                      radius={[3, 3, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartMode === "categories" && (
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                  <XAxis dataKey="category" tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} unit="h" />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border border-border/80 bg-popover p-2.5 shadow-md text-xs">
                            <div className="font-bold text-popover-foreground mb-1">{label}</div>
                            {payload.map((entry: any, i: number) => (
                              <div key={i} className="flex justify-between gap-4 text-muted-foreground">
                                <span style={{ color: entry.color }}>{entry.name}:</span>
                                <span className="font-semibold text-foreground">{formatHours(entry.value)}</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                  {selectedCountries.map((c, idx) => (
                    <Bar
                      key={c.id}
                      dataKey={c.name}
                      fill={paletteColors[idx % paletteColors.length]}
                      radius={[3, 3, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Relocation & Custom Salary Simulator */}
      <Card className="border-border/80 bg-card/70 backdrop-blur shadow-xl overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Sliders className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Purchasing Power Relocation Simulator</CardTitle>
              <CardDescription className="text-xs">
                Test how far a specific monthly budget stretches for Food + Housing across the selected economies
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1 max-w-sm">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Simulated Monthly Budget ($ USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-muted-foreground text-sm font-semibold">$</span>
                <Input
                  type="number"
                  value={simulatorWageUSD}
                  onChange={(e) => setSimulatorWageUSD(Math.max(100, parseFloat(e.target.value) || 0))}
                  className="pl-7 bg-background/80 text-sm h-9"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Quick Presets:</span>
              <Button variant="outline" size="sm" onClick={() => setSimulatorWageUSD(1500)} className="text-xs h-7">
                $1,500
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSimulatorWageUSD(3000)} className="text-xs h-7">
                $3,000
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSimulatorWageUSD(5000)} className="text-xs h-7">
                $5,000
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSimulatorWageUSD(8000)} className="text-xs h-7">
                $8,000
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedCountries.map((c) => {
              const simulatedFoodHours = (c.monthlyBasketCostUSD / (simulatorWageUSD / 160));
              const simulatedRentHours = (c.rentMonthlyUSD / (simulatorWageUSD / 160));
              const totalEssentialUSD = c.monthlyBasketCostUSD + c.rentMonthlyUSD;
              const simulatedTotalPercent = (totalEssentialUSD / simulatorWageUSD) * 100;

              return (
                <div key={c.id} className="rounded-xl border border-border/60 bg-background/50 p-4 flex flex-col justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{c.flag}</span>
                    <span className="font-bold text-xs text-foreground">{c.name}</span>
                  </div>

                  <div className="space-y-1 my-1 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Food Labor:</span>
                      <span className="font-semibold text-primary">{formatHours(simulatedFoodHours)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Rent Labor:</span>
                      <span className="font-semibold text-chart-2">{formatHours(simulatedRentHours)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-foreground pt-1 border-t border-border/40">
                      <span>Total Essential Share:</span>
                      <span>{formatPercent(simulatedTotalPercent)}</span>
                    </div>
                  </div>

                  <div className="w-full bg-secondary/50 rounded-full h-1.5 overflow-hidden mt-1">
                    <div
                      className={`h-full transition-all duration-300 ${simulatedTotalPercent > 80 ? "bg-destructive" : simulatedTotalPercent > 40 ? "bg-amber-500" : "bg-primary"}`}
                      style={{ width: `${Math.min(100, simulatedTotalPercent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
