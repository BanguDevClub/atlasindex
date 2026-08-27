import React, { useState, useEffect, useMemo } from "react";
import { RAW_COUNTRIES } from "@/data/countries";
import { getAllProcessedCountries } from "@/lib/methodology";
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
  Scale,
  Plus,
  X,
  Clock,
  Sliders,
} from "lucide-react";

export function CountryComparator() {
  const allCountries = useMemo(() => getAllProcessedCountries(RAW_COUNTRIES), []);
  const [selectedIds, setSelectedIds] = useState<string[]>(["usa", "brazil", "germany"]);
  const [simulatorWageUSD, setSimulatorWageUSD] = useState<number>(3500);

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
      .map((id) => allCountries.find((c) => c.id === id))
      .filter(Boolean) as ProcessedCountryEconomy[];
  }, [allCountries, selectedIds]);

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

  // Category comparison data for Radar / Grouped Bar
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
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
  ];

  const tierBadgeVariant = (tier: string) => {
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
            Head-to-Head Analysis
          </Badge>
          <span className="text-xs text-muted-foreground">• Compare 2 to 4 Economies</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Side-by-Side Country Comparator
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Select and contrast countries to see granular differences in essential food affordability, labor hours required per food group, and purchasing power parity.
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
                  {allCountries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.flag} {c.name}
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
                  const available = allCountries.find((c) => !selectedIds.includes(c.id));
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
            Comparing <span className="font-semibold text-foreground">{selectedCountries.length}</span> of {allCountries.length} countries
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
                  {country.isEstimated && (
                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 border-amber-500/30 text-amber-500 font-semibold">
                      Estimated
                    </Badge>
                  )}
                  <Badge variant={tierBadgeVariant(country.stressTier)} className="text-xs">
                    {country.stressTier} Stress
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-lg font-bold mt-2">{country.name}</CardTitle>
              <CardDescription className="text-xs">
                {country.continent} • Rank #{country.rank}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-3 text-xs pt-0">
              <div className="flex justify-between items-center py-1 border-b border-border/40">
                <span className="text-muted-foreground">Monthly Median Wage:</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(country.monthlyMedianWageUSD, "USD")}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/40">
                <span className="text-muted-foreground">Monthly Basket Cost:</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(country.monthlyBasketCostUSD, "USD")}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/40">
                <span className="text-muted-foreground">Wage Share for Food:</span>
                <span className="font-bold text-base text-primary">
                  {formatPercent(country.basketPercentOfWage)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/40">
                <span className="text-muted-foreground">Labor Hours Required:</span>
                <span className="font-bold text-foreground">
                  {formatHours(country.laborHoursForBasket)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">APPI Score:</span>
                <span className="font-bold text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                  {country.appiScore} / 100
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visual Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Item Labor Minutes Bar Chart */}
        <Card className="border-border/80 bg-card/60 backdrop-blur shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              <span>Minutes of Labor Per Food Item</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Minutes of work needed at median wage to purchase 1 unit (1kg / 12 eggs)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[320px] w-full">
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
          </CardContent>
        </Card>

        {/* Category Labor Hours Chart */}
        <Card className="border-border/80 bg-card/60 backdrop-blur shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Scale className="size-4 text-primary" />
              <span>Category Labor Breakdown (Hours)</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Monthly hours of work distributed across nutritional categories
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[320px] w-full">
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
          </CardContent>
        </Card>
      </div>

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
                Test how far a specific monthly budget would stretch across the selected economies
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
              const simulatedHours = (c.monthlyBasketCostUSD / (simulatorWageUSD / 160));
              const simulatedPercent = (c.monthlyBasketCostUSD / simulatorWageUSD) * 100;
              return (
                <div key={c.id} className="rounded-xl border border-border/60 bg-background/50 p-4 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{c.flag}</span>
                    <span className="font-bold text-xs text-foreground">{c.name}</span>
                  </div>

                  <div className="space-y-1 my-1">
                    <div className="text-lg font-bold text-primary">
                      {formatHours(simulatedHours)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatPercent(simulatedPercent)} of ${simulatorWageUSD}/mo
                    </div>
                  </div>

                  <div className="w-full bg-secondary/50 rounded-full h-1.5 overflow-hidden mt-2">
                    <div
                      className="bg-primary h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, simulatedPercent)}%` }}
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
