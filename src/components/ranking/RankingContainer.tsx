import React, { useState, useMemo } from "react";
import { RAW_COUNTRIES } from "@/data/countries";
import { getAllProcessedCountries } from "@/lib/methodology";
import type { ProcessedCountryEconomy, StressTier } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatCurrency, formatHours, formatPercent, formatMinutes } from "@/lib/utils";
import {
  Search,
  Download,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

type SortField =
  | "rank"
  | "name"
  | "wageUSD"
  | "basketUSD"
  | "basketPercent"
  | "laborHours"
  | "remainingUSD"
  | "appiScore";

export function RankingContainer() {
  const allCountries = useMemo(() => getAllProcessedCountries(RAW_COUNTRIES), []);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedContinent, setSelectedContinent] = useState<string>("All");
  const [selectedTier, setSelectedTier] = useState<string>("All");
  const [basketFocus, setBasketFocus] = useState<"all" | "meat" | "staples" | "dairy">("all");
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [expandedCountryId, setExpandedCountryId] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === "rank" || field === "basketPercent" || field === "laborHours" ? true : false);
    }
  };

  const filteredAndSortedCountries = useMemo(() => {
    const list = allCountries.filter((c) => {
      const matchContinent = selectedContinent === "All" || c.continent === selectedContinent;
      const matchTier = selectedTier === "All" || c.stressTier === selectedTier;
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.currencyCode.toLowerCase().includes(searchQuery.toLowerCase());
      return matchContinent && matchTier && matchSearch;
    });

    list.sort((a, b) => {
      let valA: any = a.rank;
      let valB: any = b.rank;

      switch (sortField) {
        case "name":
          valA = a.name;
          valB = b.name;
          break;
        case "wageUSD":
          valA = a.monthlyMedianWageUSD;
          valB = b.monthlyMedianWageUSD;
          break;
        case "basketUSD":
          valA = a.monthlyBasketCostUSD;
          valB = b.monthlyBasketCostUSD;
          break;
        case "basketPercent":
          valA = a.basketPercentOfWage;
          valB = b.basketPercentOfWage;
          break;
        case "laborHours":
          valA = a.laborHoursForBasket;
          valB = b.laborHoursForBasket;
          break;
        case "remainingUSD":
          valA = a.remainingDisposableWageUSD;
          valB = b.remainingDisposableWageUSD;
          break;
        case "appiScore":
          valA = a.appiScore;
          valB = b.appiScore;
          break;
        default:
          valA = a.rank || 0;
          valB = b.rank || 0;
      }

      if (typeof valA === "string") {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });

    return list;
  }, [allCountries, searchQuery, selectedContinent, selectedTier, sortField, sortAsc]);

  const tierBadgeVariant = (tier: string) => {
    switch (tier) {
      case "Low": return "tierLow";
      case "Moderate": return "tierModerate";
      case "High": return "tierHigh";
      default: return "tierSevere";
    }
  };

  const exportCSV = () => {
    const headers = [
      "Rank",
      "Country",
      "Code",
      "Continent",
      "Currency",
      "Median_Wage_Local",
      "Median_Wage_USD",
      "Basket_Cost_Local",
      "Basket_Cost_USD",
      "Basket_Percent_Wage",
      "Labor_Hours_Required",
      "Remaining_Wage_Local",
      "Remaining_Wage_USD",
      "Remaining_Labor_Hours",
      "APPI_Score",
      "Stress_Tier",
      "Wage_Source",
      "Price_Source",
    ];

    const rows = filteredAndSortedCountries.map((c) => [
      c.rank,
      `"${c.name}"`,
      c.code,
      `"${c.continent}"`,
      c.currencyCode,
      c.monthlyMedianWageLocal,
      c.monthlyMedianWageUSD.toFixed(2),
      c.monthlyBasketCostLocal.toFixed(2),
      c.monthlyBasketCostUSD.toFixed(2),
      c.basketPercentOfWage.toFixed(2),
      c.laborHoursForBasket.toFixed(2),
      c.remainingDisposableWageLocal.toFixed(2),
      c.remainingDisposableWageUSD.toFixed(2),
      c.remainingLaborHours.toFixed(2),
      c.appiScore,
      c.stressTier,
      `"${c.wageSource}"`,
      `"${c.priceSource}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `atlasindex_global_rankings_2025.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const jsonStr = JSON.stringify(filteredAndSortedCountries, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "atlasindex_dataset_2025.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const continents = ["All", "Americas", "Europe", "Asia-Pacific", "Africa & Middle East"];
  const tiers = ["All", "Low", "Moderate", "High", "Severe"];

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-primary/10 border-primary/20 text-primary">
              Global Benchmark
            </Badge>
            <span className="text-xs text-muted-foreground">• Complete 26-Country League Table</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mt-1">
            Global Food Labor & Purchasing Power Rankings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Ranked from highest purchasing power (#1 Lowest Effort) to highest nutritional burden.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} className="text-xs gap-1.5 bg-card">
            <Download className="size-3.5" />
            <span>Export CSV</span>
          </Button>
          <Button variant="outline" size="sm" onClick={exportJSON} className="text-xs gap-1.5 bg-card">
            <Download className="size-3.5" />
            <span>JSON</span>
          </Button>
        </div>
      </div>

      {/* Controls Bar */}
      <Card className="border-border/80 bg-card/70 backdrop-blur p-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="size-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by country, code (US, BR, DE) or currency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/80 text-xs h-9"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Region:</span>
              <select
                value={selectedContinent}
                onChange={(e) => setSelectedContinent(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {continents.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Tier:</span>
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
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <Card className="border-border/80 bg-card/60 backdrop-blur shadow-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[70px] cursor-pointer" onClick={() => handleSort("rank")}>
                <div className="flex items-center gap-1">
                  <span>Rank</span>
                  {sortField === "rank" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                </div>
              </TableHead>
              <TableHead className="min-w-[180px] cursor-pointer" onClick={() => handleSort("name")}>
                <div className="flex items-center gap-1">
                  <span>Country</span>
                  {sortField === "name" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort("wageUSD")}>
                <div className="flex items-center justify-end gap-1">
                  <span>Median Wage</span>
                  {sortField === "wageUSD" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort("basketUSD")}>
                <div className="flex items-center justify-end gap-1">
                  <span>Basket Cost</span>
                  {sortField === "basketUSD" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort("basketPercent")}>
                <div className="flex items-center justify-end gap-1">
                  <span>Wage Share (%)</span>
                  {sortField === "basketPercent" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort("laborHours")}>
                <div className="flex items-center justify-end gap-1">
                  <span>Labor Effort</span>
                  {sortField === "laborHours" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort("remainingUSD")}>
                <div className="flex items-center justify-end gap-1">
                  <span>Value After Food</span>
                  {sortField === "remainingUSD" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer text-center" onClick={() => handleSort("appiScore")}>
                <div className="flex items-center justify-center gap-1">
                  <span>APPI Score</span>
                  {sortField === "appiScore" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                </div>
              </TableHead>
              <TableHead className="text-center">Tier</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedCountries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                  No countries found matching active filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedCountries.map((country) => {
                const isExpanded = expandedCountryId === country.id;
                return (
                  <React.Fragment key={country.id}>
                    <TableRow className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-bold text-xs text-muted-foreground">
                        #{country.rank}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedCountryId(isExpanded ? null : country.id)}
                            className="size-5 rounded hover:bg-muted flex items-center justify-center text-muted-foreground"
                          >
                            {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                          </button>
                          <span className="text-base">{country.flag}</span>
                          <div>
                            <span className="font-semibold text-foreground text-xs block">{country.name}</span>
                            <span className="text-[10px] text-muted-foreground">{country.continent}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        <div className="font-medium">{formatCurrency(country.monthlyMedianWageUSD, "USD")}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {formatCurrency(country.monthlyMedianWageLocal, country.currencyCode)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        <div className="font-medium">{formatCurrency(country.monthlyBasketCostUSD, "USD")}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {formatCurrency(country.monthlyBasketCostLocal, country.currencyCode)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-xs font-bold">
                        <span
                          className={
                            country.basketPercentOfWage < 10
                              ? "text-emerald-500"
                              : country.basketPercentOfWage < 20
                              ? "text-amber-500"
                              : country.basketPercentOfWage < 35
                              ? "text-orange-500"
                              : "text-rose-500"
                          }
                        >
                          {formatPercent(country.basketPercentOfWage)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-xs font-semibold text-primary">
                        {formatHours(country.laborHoursForBasket)}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        <div className="font-semibold text-emerald-500">
                          {formatCurrency(country.remainingDisposableWageUSD, "USD")}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {formatCurrency(country.remainingDisposableWageLocal, country.currencyCode)} • {formatHours(country.remainingLaborHours)} left
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex items-center justify-center font-bold text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                          {country.appiScore}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={tierBadgeVariant(country.stressTier)} className="text-[10px]">
                          {country.stressTier}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a href={`/compare?c1=${country.id}&c2=usa`}>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px]">
                              Compare
                            </Button>
                          </a>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* EXPANDED ROW: Granular Item Breakdown */}
                    {isExpanded && (
                      <TableRow className="bg-muted/15">
                        <TableCell colSpan={10} className="p-4">
                          <div className="rounded-xl border border-border/60 bg-background/60 p-4 flex flex-col gap-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-foreground">
                                  {country.flag} {country.name} — Itemized Food Basket & Labor Minutes
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  (Hourly median wage: {formatCurrency(country.hourlyMedianWageUSD, "USD")}/hr)
                                </span>
                              </div>
                              <span className="text-[10px] text-muted-foreground">
                                Source: {country.wageSource} & {country.priceSource}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 text-xs">
                              {country.items.map((item) => (
                                <div key={item.itemId} className="rounded-lg bg-card p-2 border border-border/40 flex flex-col justify-between">
                                  <span className="text-[11px] font-medium text-foreground truncate">{item.name}</span>
                                  <div className="mt-1 flex items-baseline justify-between">
                                    <span className="text-[10px] text-muted-foreground">{formatCurrency(item.unitPriceUSD, "USD")}</span>
                                    <span className="font-bold text-primary text-[11px]">
                                      {formatMinutes(item.minutesOfWorkPerUnit)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
