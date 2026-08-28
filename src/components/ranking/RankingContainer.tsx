import React, { useState, useMemo } from "react";
import { getAllProcessedCountries, getWorldAverageCountry } from "@/lib/methodology";
import { RAW_COUNTRIES } from "@/data/countries";
import type { ProcessedCountryEconomy, StressTier } from "@/lib/types";
import { formatCurrency, formatHours, formatMinutes, formatPercent, getBasePath } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/SearchableSelect";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Download,
  Utensils,
  Home,
  Car,
  Stethoscope,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Layers,
  Globe,
  ShieldCheck,
} from "lucide-react";

type PillarView = "overview" | "essentials" | "luxury" | "food" | "rent" | "car" | "medical";

type SortField =
  | "rank"
  | "name"
  | "wageUSD"
  | "basketUSD"
  | "basketPercent"
  | "laborHours"
  | "rentUSD"
  | "rentPercent"
  | "rentHours"
  | "carUSD"
  | "carMonths"
  | "medicalUSD"
  | "medicalPercent"
  | "medicalHours"
  | "totalPercent"
  | "totalHours"
  | "appiEssentials"
  | "appiLuxury"
  | "appiScore";

export function RankingContainer() {
  const allCountries = useMemo(() => getAllProcessedCountries(RAW_COUNTRIES), []);
  const worldAvgCountry = useMemo(() => getWorldAverageCountry(allCountries), [allCountries]);

  const [pillarView, setPillarView] = useState<PillarView>("overview");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedContinent, setSelectedContinent] = useState<string>("All");
  const [selectedTier, setSelectedTier] = useState<string>("All");
  const [dataFilter, setDataFilter] = useState<"all" | "official" | "estimated">("all");
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [expandedCountryId, setExpandedCountryId] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(
        field === "rank" ||
        field === "basketPercent" ||
        field === "laborHours" ||
        field === "rentPercent" ||
        field === "rentHours" ||
        field === "carMonths" ||
        field === "medicalPercent" ||
        field === "medicalHours" ||
        field === "totalPercent" ||
        field === "totalHours"
          ? true
          : false
      );
    }
  };

  const filteredAndSortedCountries = useMemo(() => {
    const list = allCountries.filter((c) => {
      const matchContinent = selectedContinent === "All" || c.continent === selectedContinent;
      const matchTier = selectedTier === "All" || c.stressTier === selectedTier;
      const matchDataType =
        dataFilter === "all" ||
        (dataFilter === "official" && !c.isEstimated) ||
        (dataFilter === "estimated" && c.isEstimated);
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.currencyCode.toLowerCase().includes(searchQuery.toLowerCase());
      return matchContinent && matchTier && matchDataType && matchSearch;
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
        case "rentUSD":
          valA = a.rentMonthlyUSD;
          valB = b.rentMonthlyUSD;
          break;
        case "rentPercent":
          valA = a.rentPercentOfWage;
          valB = b.rentPercentOfWage;
          break;
        case "rentHours":
          valA = a.rentLaborHours;
          valB = b.rentLaborHours;
          break;
        case "carUSD":
          valA = a.carPriceUSD;
          valB = b.carPriceUSD;
          break;
        case "carMonths":
          valA = a.carLaborMonths;
          valB = b.carLaborMonths;
          break;
        case "medicalUSD":
          valA = a.medicalCheckupUSD;
          valB = b.medicalCheckupUSD;
          break;
        case "medicalPercent":
          valA = a.medicalCheckupPercentOfWage;
          valB = b.medicalCheckupPercentOfWage;
          break;
        case "medicalHours":
          valA = a.medicalCheckupLaborHours;
          valB = b.medicalCheckupLaborHours;
          break;
        case "totalPercent":
          valA = a.totalEssentialPercentOfWage;
          valB = b.totalEssentialPercentOfWage;
          break;
        case "totalHours":
          valA = a.totalEssentialLaborHours;
          valB = b.totalEssentialLaborHours;
          break;
        case "appiEssentials":
          valA = a.appiEssentials;
          valB = b.appiEssentials;
          break;
        case "appiLuxury":
          valA = a.appiLuxury;
          valB = b.appiLuxury;
          break;
        case "appiScore":
          valA = a.appiScore;
          valB = b.appiScore;
          break;
        case "rank":
        default:
          valA = a.rank ?? 999;
          valB = b.rank ?? 999;
          break;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return list;
  }, [allCountries, searchQuery, selectedContinent, selectedTier, dataFilter, sortField, sortAsc]);

  const tierBadgeVariant = (tier: StressTier) => {
    switch (tier) {
      case "Low":
        return "success";
      case "Moderate":
        return "warning";
      case "High":
        return "secondary";
      case "Severe":
        return "destructive";
    }
  };

  const exportCSV = () => {
    const headers = [
      "Rank",
      "Country",
      "Code",
      "Continent",
      "Data Type",
      "Median Wage USD",
      "APPI Score (70/30)",
      "APPI Essentials (Food+Rent)",
      "APPI Luxury (Health+Car)",
      "Food Basket USD",
      "Food Basket % of Wage",
      "Food Labor Hours",
      "1-BR Rent USD",
      "Rent % of Wage",
      "Rent Labor Hours",
      "Passenger Car USD",
      "Car Labor Months",
      "Medical Checkup USD",
      "Medical % of Wage",
      "Medical Labor Hours",
      "Essential Living USD",
      "Essential % of Wage",
      "Essential Labor Hours",
      "Stress Tier",
      "Wage Source",
      "Price Source",
      "Estimation Disclaimer",
    ];

    const rows = filteredAndSortedCountries.map((c) => [
      c.rank,
      `"${c.name}"`,
      c.code,
      c.continent,
      c.isEstimated ? "Estimated" : "Official",
      c.monthlyMedianWageUSD.toFixed(2),
      c.appiScore,
      c.appiEssentials,
      c.appiLuxury,
      c.monthlyBasketCostUSD.toFixed(2),
      c.basketPercentOfWage.toFixed(2),
      c.laborHoursForBasket.toFixed(1),
      c.rentMonthlyUSD.toFixed(2),
      c.rentPercentOfWage.toFixed(2),
      c.rentLaborHours.toFixed(1),
      c.carPriceUSD.toFixed(2),
      c.carLaborMonths.toFixed(1),
      c.medicalCheckupUSD.toFixed(2),
      c.medicalCheckupPercentOfWage.toFixed(2),
      c.medicalCheckupLaborHours.toFixed(1),
      c.totalEssentialMonthlyCostUSD.toFixed(2),
      c.totalEssentialPercentOfWage.toFixed(2),
      c.totalEssentialLaborHours.toFixed(1),
      c.stressTier,
      `"${c.wageSource}"`,
      `"${c.priceSource}"`,
      `"${c.estimationDisclaimer || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "atlasindex_global_rankings_2025.csv");
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

  const continents = ["All", "Europe", "Americas", "Asia", "Oceania", "Africa"];
  const tiers = ["All", "Low", "Moderate", "High", "Severe"];

  const continentFilterOptions: SearchableSelectOption[] = useMemo(() => {
    return continents.map((c) => ({
      value: c,
      label: c === "All" ? "All Continents" : c,
    }));
  }, [continents]);

  const tierFilterOptions: SearchableSelectOption[] = useMemo(() => {
    return tiers.map((t) => ({
      value: t,
      label: t === "All" ? "All Tiers" : `${t} Stress`,
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

  const dataSourceOptions: SearchableSelectOption[] = useMemo(
    () => [
      { value: "all", label: "All 195 Nations", sublabel: "176 Official + 19 Estimated" },
      { value: "official", label: "Official Reports", sublabel: "176 sovereign states" },
      {
        value: "estimated",
        label: "Estimates Only",
        sublabel: "19 data-sparse states",
        badge: "Est.",
        badgeVariant: "warning",
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-primary/10 border-primary/20 text-primary">
              Global Benchmark
            </Badge>
            <span className="text-xs text-muted-foreground">• Complete 195 Sovereign Nations Multi-Pillar League Table</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mt-1">
            Global Purchasing Power & Labor Effort Rankings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Every country in the world ranked by <strong>APPI Composite (70% Essentials + 30% Luxury)</strong>, Food, 1-BR Rent, Passenger Car, and Medical Exams.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <a href={getBasePath("/continents")}>
            <Button variant="outline" size="sm" className="text-xs gap-1 bg-card text-primary border-primary/30 hover:bg-primary/10">
              <span>Continents</span>
              <span>→</span>
            </Button>
          </a>
          <Button variant="outline" size="sm" onClick={exportCSV} className="text-xs gap-1.5 bg-card">
            <Download className="size-3.5" />
            <span>CSV</span>
          </Button>
          <Button variant="outline" size="sm" onClick={exportJSON} className="text-xs gap-1.5 bg-card">
            <Download className="size-3.5" />
            <span>JSON</span>
          </Button>
        </div>
      </div>

      {/* Pillar Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <Button
          variant={pillarView === "overview" ? "default" : "outline"}
          size="sm"
          onClick={() => setPillarView("overview")}
          className="text-xs h-8 px-3 gap-1.5"
        >
          <Layers className="size-3.5" />
          <span>APPI Composite Overview</span>
        </Button>
        <Button
          variant={pillarView === "essentials" ? "default" : "outline"}
          size="sm"
          onClick={() => setPillarView("essentials")}
          className="text-xs h-8 px-3 gap-1.5"
        >
          <Utensils className="size-3.5" />
          <span>APPI Essentials (Food + Rent)</span>
        </Button>
        <Button
          variant={pillarView === "luxury" ? "default" : "outline"}
          size="sm"
          onClick={() => setPillarView("luxury")}
          className="text-xs h-8 px-3 gap-1.5"
        >
          <Sparkles className="size-3.5" />
          <span>APPI Luxury (Health + Car)</span>
        </Button>
        <Button
          variant={pillarView === "food" ? "default" : "outline"}
          size="sm"
          onClick={() => setPillarView("food")}
          className="text-xs h-8 px-3 gap-1.5"
        >
          <Utensils className="size-3.5" />
          <span>Food Basket</span>
        </Button>
        <Button
          variant={pillarView === "rent" ? "default" : "outline"}
          size="sm"
          onClick={() => setPillarView("rent")}
          className="text-xs h-8 px-3 gap-1.5"
        >
          <Home className="size-3.5" />
          <span>1-BR Rent</span>
        </Button>
        <Button
          variant={pillarView === "car" ? "default" : "outline"}
          size="sm"
          onClick={() => setPillarView("car")}
          className="text-xs h-8 px-3 gap-1.5"
        >
          <Car className="size-3.5" />
          <span>Passenger Car</span>
        </Button>
        <Button
          variant={pillarView === "medical" ? "default" : "outline"}
          size="sm"
          onClick={() => setPillarView("medical")}
          className="text-xs h-8 px-3 gap-1.5"
        >
          <Stethoscope className="size-3.5" />
          <span>Medical Exam</span>
        </Button>
      </div>

      {/* Controls Bar */}
      <Card className="border-border/80 bg-card/70 backdrop-blur p-4 sm:p-5 shadow-sm relative z-30 overflow-visible">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="size-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search country (e.g. North Korea, Brazil, Japan)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/80 text-xs h-9 rounded-xl"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full lg:w-auto">
            <div className="w-full sm:w-[150px]">
              <SearchableSelect
                options={continentFilterOptions}
                value={selectedContinent}
                onChange={setSelectedContinent}
                placeholder="Continent..."
                searchPlaceholder="Search continent..."
                size="sm"
                align="left"
                ariaLabel="Filter by Continent"
              />
            </div>

            <div className="w-full sm:w-[150px]">
              <SearchableSelect
                options={tierFilterOptions}
                value={selectedTier}
                onChange={setSelectedTier}
                placeholder="Stress Tier..."
                searchPlaceholder="Search tier..."
                size="sm"
                align="left"
                ariaLabel="Filter by Stress Tier"
              />
            </div>

            <div className="w-full sm:w-[160px]">
              <SearchableSelect
                options={dataSourceOptions}
                value={dataFilter}
                onChange={(v) => setDataFilter(v as any)}
                placeholder="Data Source..."
                searchPlaceholder="Search source..."
                size="sm"
                align="right"
                ariaLabel="Filter by Data Source"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Sticky Table with Frozen Header and Pinned World Average Benchmark */}
      <Table containerClassName="max-h-[720px] rounded-xl border border-border/80 bg-card/60 backdrop-blur shadow-md scrollbar-thin" className="relative w-full border-collapse">
        <TableHeader className="sticky top-0 z-30 bg-card/95 backdrop-blur-md shadow-sm border-b border-border">
          <TableRow className="hover:bg-transparent border-b border-border/80">
            <TableHead className="w-[70px] cursor-pointer bg-inherit" onClick={() => handleSort("rank")}>
              <div className="flex items-center gap-1">
                <span>Rank</span>
                {sortField === "rank" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
              </div>
            </TableHead>
            <TableHead className="min-w-[180px] cursor-pointer bg-inherit" onClick={() => handleSort("name")}>
              <div className="flex items-center gap-1">
                <span>Country</span>
                {sortField === "name" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer text-right bg-inherit" onClick={() => handleSort("wageUSD")}>
              <div className="flex items-center justify-end gap-1">
                <span>Median Wage</span>
                {sortField === "wageUSD" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
              </div>
            </TableHead>

            {/* OVERVIEW MODE COLUMNS */}
            {pillarView === "overview" && (
              <>
                <TableHead className="cursor-pointer text-right bg-inherit" onClick={() => handleSort("appiEssentials")}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Essentials (Food+Rent)</span>
                    {sortField === "appiEssentials" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-right bg-inherit" onClick={() => handleSort("appiLuxury")}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Luxury (Health+Car)</span>
                    {sortField === "appiLuxury" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-right bg-inherit" onClick={() => handleSort("totalHours")}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Living Effort (hrs)</span>
                    {sortField === "totalHours" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-center bg-inherit" onClick={() => handleSort("appiScore")}>
                  <div className="flex items-center justify-center gap-1">
                    <span>APPI (70/30)</span>
                    {sortField === "appiScore" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                  </div>
                </TableHead>
              </>
            )}

            {/* ESSENTIALS MODE COLUMNS */}
            {pillarView === "essentials" && (
              <>
                <TableHead className="cursor-pointer text-right bg-inherit" onClick={() => handleSort("basketPercent")}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Food Basket (% / $)</span>
                    {sortField === "basketPercent" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-right bg-inherit" onClick={() => handleSort("rentPercent")}>
                  <div className="flex items-center justify-end gap-1">
                    <span>1-BR Rent (% / $)</span>
                    {sortField === "rentPercent" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-right bg-inherit" onClick={() => handleSort("totalHours")}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Total Essential Labor</span>
                    {sortField === "totalHours" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-center bg-inherit" onClick={() => handleSort("appiEssentials")}>
                  <div className="flex items-center justify-center gap-1">
                    <span>Essentials Score</span>
                    {sortField === "appiEssentials" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                  </div>
                </TableHead>
              </>
            )}

            {/* LUXURY MODE COLUMNS */}
            {pillarView === "luxury" && (
              <>
                <TableHead className="cursor-pointer text-right bg-inherit" onClick={() => handleSort("medicalPercent")}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Checkup Exam (% / $)</span>
                    {sortField === "medicalPercent" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-right bg-inherit" onClick={() => handleSort("carMonths")}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Passenger Car (Mos / $)</span>
                    {sortField === "carMonths" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-center bg-inherit" onClick={() => handleSort("appiLuxury")}>
                  <div className="flex items-center justify-center gap-1">
                    <span>Luxury Score</span>
                    {sortField === "appiLuxury" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                  </div>
                </TableHead>
              </>
            )}

            {/* FOOD MODE COLUMNS */}
            {pillarView === "food" && (
              <>
                <TableHead className="cursor-pointer text-right bg-inherit" onClick={() => handleSort("basketUSD")}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Food Basket Cost</span>
                    {sortField === "basketUSD" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-right bg-inherit" onClick={() => handleSort("basketPercent")}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Wage Share (%)</span>
                    {sortField === "basketPercent" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-right bg-inherit" onClick={() => handleSort("laborHours")}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Labor Hours</span>
                    {sortField === "laborHours" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                  </div>
                </TableHead>
              </>
            )}

            {/* RENT MODE COLUMNS */}
            {pillarView === "rent" && (
              <>
                <TableHead className="cursor-pointer text-right bg-inherit" onClick={() => handleSort("rentUSD")}>
                  <div className="flex items-center justify-end gap-1">
                    <span>1-BR Monthly Rent</span>
                    {sortField === "rentUSD" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-right bg-inherit" onClick={() => handleSort("rentPercent")}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Rent Wage Share (%)</span>
                    {sortField === "rentPercent" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-right bg-inherit" onClick={() => handleSort("rentHours")}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Labor Hours</span>
                    {sortField === "rentHours" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                  </div>
                </TableHead>
              </>
            )}

            {/* CAR MODE COLUMNS */}
            {pillarView === "car" && (
              <>
                <TableHead className="cursor-pointer text-right bg-inherit" onClick={() => handleSort("carUSD")}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Car Retail Price ($)</span>
                    {sortField === "carUSD" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-right bg-inherit" onClick={() => handleSort("carMonths")}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Labor Months</span>
                    {sortField === "carMonths" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                  </div>
                </TableHead>
              </>
            )}

            {/* MEDICAL MODE COLUMNS */}
            {pillarView === "medical" && (
              <>
                <TableHead className="cursor-pointer text-right bg-inherit" onClick={() => handleSort("medicalUSD")}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Checkup Exam ($)</span>
                    {sortField === "medicalUSD" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-right bg-inherit" onClick={() => handleSort("medicalPercent")}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Wage Share (%)</span>
                    {sortField === "medicalPercent" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-right bg-inherit" onClick={() => handleSort("medicalHours")}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Labor Hours</span>
                    {sortField === "medicalHours" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                  </div>
                </TableHead>
              </>
            )}

            <TableHead className="text-center bg-inherit">Tier</TableHead>
            <TableHead className="text-right bg-inherit">Actions</TableHead>
          </TableRow>

          {/* PINNED FROZEN GLOBAL AVERAGE BENCHMARK ROW (INSIDE THEAD) */}
          <TableRow className="bg-primary/20 hover:bg-primary/25 border-b-2 border-primary/50 font-semibold text-xs shadow-xs">
            <TableCell className="font-bold text-primary bg-card/95 backdrop-blur-md">
              <Globe className="size-3.5 inline mr-1 text-primary" /> Avg
            </TableCell>
            <TableCell className="bg-card/95 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="text-base">{worldAvgCountry.flag}</span>
                <div>
                  <span className="font-bold text-primary">{worldAvgCountry.name}</span>
                  <span className="text-[10px] text-muted-foreground block">Global 195 Nations Baseline</span>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-right font-bold bg-card/95 backdrop-blur-md">
              ${worldAvgCountry.monthlyMedianWageUSD.toFixed(0)}/mo
            </TableCell>

            {/* OVERVIEW GLOBAL ROW */}
            {pillarView === "overview" && (
              <>
                <TableCell className="text-right font-bold text-chart-2 bg-card/95 backdrop-blur-md">
                  {worldAvgCountry.appiEssentials} <span className="text-[10px] text-muted-foreground font-normal">({worldAvgCountry.totalEssentialPercentOfWage.toFixed(0)}%)</span>
                </TableCell>
                <TableCell className="text-right font-bold text-chart-4 bg-card/95 backdrop-blur-md">
                  {worldAvgCountry.appiLuxury} <span className="text-[10px] text-muted-foreground font-normal">({worldAvgCountry.carLaborMonths.toFixed(0)}mo)</span>
                </TableCell>
                <TableCell className="text-right font-bold text-rose-500 bg-card/95 backdrop-blur-md">
                  {worldAvgCountry.totalEssentialLaborHours.toFixed(0)}h
                </TableCell>
                <TableCell className="text-center bg-card/95 backdrop-blur-md">
                  <span className="px-2 py-0.5 rounded-md bg-primary text-primary-foreground font-extrabold text-xs shadow-sm">
                    {worldAvgCountry.appiScore}
                  </span>
                </TableCell>
              </>
            )}

            {/* ESSENTIALS GLOBAL ROW */}
            {pillarView === "essentials" && (
              <>
                <TableCell className="text-right font-bold text-primary bg-card/95 backdrop-blur-md">
                  {worldAvgCountry.basketPercentOfWage.toFixed(1)}% (${worldAvgCountry.monthlyBasketCostUSD.toFixed(0)})
                </TableCell>
                <TableCell className="text-right font-bold text-chart-2 bg-card/95 backdrop-blur-md">
                  {worldAvgCountry.rentPercentOfWage.toFixed(1)}% (${worldAvgCountry.rentMonthlyUSD.toFixed(0)})
                </TableCell>
                <TableCell className="text-right font-bold text-rose-500 bg-card/95 backdrop-blur-md">
                  {worldAvgCountry.totalEssentialLaborHours.toFixed(1)}h
                </TableCell>
                <TableCell className="text-center bg-card/95 backdrop-blur-md">
                  <span className="px-2 py-0.5 rounded bg-chart-2/20 text-chart-2 font-bold text-xs">
                    {worldAvgCountry.appiEssentials}
                  </span>
                </TableCell>
              </>
            )}

            {/* LUXURY GLOBAL ROW */}
            {pillarView === "luxury" && (
              <>
                <TableCell className="text-right font-bold text-rose-500 bg-card/95 backdrop-blur-md">
                  {worldAvgCountry.medicalCheckupPercentOfWage.toFixed(1)}% (${worldAvgCountry.medicalCheckupUSD.toFixed(0)})
                </TableCell>
                <TableCell className="text-right font-bold text-chart-4 bg-card/95 backdrop-blur-md">
                  {worldAvgCountry.carLaborMonths.toFixed(1)} mos (${worldAvgCountry.carPriceUSD.toFixed(0)})
                </TableCell>
                <TableCell className="text-center bg-card/95 backdrop-blur-md">
                  <span className="px-2 py-0.5 rounded bg-chart-4/20 text-chart-4 font-bold text-xs">
                    {worldAvgCountry.appiLuxury}
                  </span>
                </TableCell>
              </>
            )}

            {/* FOOD GLOBAL ROW */}
            {pillarView === "food" && (
              <>
                <TableCell className="text-right font-bold bg-card/95 backdrop-blur-md">${worldAvgCountry.monthlyBasketCostUSD.toFixed(1)}</TableCell>
                <TableCell className="text-right font-bold text-primary bg-card/95 backdrop-blur-md">{worldAvgCountry.basketPercentOfWage.toFixed(1)}%</TableCell>
                <TableCell className="text-right font-bold bg-card/95 backdrop-blur-md">{worldAvgCountry.laborHoursForBasket.toFixed(1)}h</TableCell>
              </>
            )}

            {/* RENT GLOBAL ROW */}
            {pillarView === "rent" && (
              <>
                <TableCell className="text-right font-bold bg-card/95 backdrop-blur-md">${worldAvgCountry.rentMonthlyUSD.toFixed(0)}</TableCell>
                <TableCell className="text-right font-bold text-chart-2 bg-card/95 backdrop-blur-md">{worldAvgCountry.rentPercentOfWage.toFixed(1)}%</TableCell>
                <TableCell className="text-right font-bold bg-card/95 backdrop-blur-md">{worldAvgCountry.rentLaborHours.toFixed(1)}h</TableCell>
              </>
            )}

            {/* CAR GLOBAL ROW */}
            {pillarView === "car" && (
              <>
                <TableCell className="text-right font-bold bg-card/95 backdrop-blur-md">${worldAvgCountry.carPriceUSD.toFixed(0)}</TableCell>
                <TableCell className="text-right font-bold text-chart-4 bg-card/95 backdrop-blur-md">{worldAvgCountry.carLaborMonths.toFixed(1)} mos</TableCell>
              </>
            )}

            {/* MEDICAL GLOBAL ROW */}
            {pillarView === "medical" && (
              <>
                <TableCell className="text-right font-bold bg-card/95 backdrop-blur-md">${worldAvgCountry.medicalCheckupUSD.toFixed(1)}</TableCell>
                <TableCell className="text-right font-bold text-rose-500 bg-card/95 backdrop-blur-md">{worldAvgCountry.medicalCheckupPercentOfWage.toFixed(1)}%</TableCell>
                <TableCell className="text-right font-bold bg-card/95 backdrop-blur-md">{worldAvgCountry.medicalCheckupLaborHours.toFixed(1)}h</TableCell>
              </>
            )}

            <TableCell className="text-center bg-card/95 backdrop-blur-md">
              <Badge variant="outline" className="text-[10px] bg-primary/20 text-primary border-primary/30">
                Global
              </Badge>
            </TableCell>
            <TableCell className="text-right bg-card/95 backdrop-blur-md">
              <a href={getBasePath(`compare?c1=world-average&c2=usa`)}>
                <Button variant="outline" size="sm" className="h-6 px-2 text-[10px] bg-primary/20 text-primary border-primary/30">
                  Compare
                </Button>
              </a>
            </TableCell>
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
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-foreground text-xs">{country.name}</span>
                              {country.isEstimated && (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] px-1 py-0 bg-amber-500/10 border-amber-500/30 text-amber-500 font-semibold"
                                  title="Econometrically estimated due to restricted public reporting"
                                >
                                  Est.
                                </Badge>
                              )}
                            </div>
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

                      {/* OVERVIEW CELLS */}
                      {pillarView === "overview" && (
                        <>
                          <TableCell className="text-right text-xs font-semibold">
                            <div className="text-chart-2 font-bold">{country.appiEssentials}</div>
                            <div className="text-[10px] text-muted-foreground">{formatPercent(country.totalEssentialPercentOfWage)}</div>
                          </TableCell>
                          <TableCell className="text-right text-xs font-semibold">
                            <div className="text-chart-4 font-bold">{country.appiLuxury}</div>
                            <div className="text-[10px] text-muted-foreground">{country.carLaborMonths.toFixed(1)} mo car</div>
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            <div className="font-medium text-foreground">{formatHours(country.totalEssentialLaborHours)}</div>
                            <div className="text-[10px] text-muted-foreground">${country.totalEssentialMonthlyCostUSD.toFixed(0)}/mo</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="inline-flex items-center justify-center font-extrabold text-xs px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 shadow-xs">
                              {country.appiScore}
                            </div>
                          </TableCell>
                        </>
                      )}

                      {/* ESSENTIALS CELLS */}
                      {pillarView === "essentials" && (
                        <>
                          <TableCell className="text-right text-xs">
                            <div className="font-semibold text-foreground">{formatPercent(country.basketPercentOfWage)}</div>
                            <div className="text-[10px] text-muted-foreground">${country.monthlyBasketCostUSD.toFixed(0)}</div>
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            <div className="font-semibold text-foreground">{formatPercent(country.rentPercentOfWage)}</div>
                            <div className="text-[10px] text-muted-foreground">${country.rentMonthlyUSD.toFixed(0)}</div>
                          </TableCell>
                          <TableCell className="text-right text-xs font-semibold text-primary">
                            {formatHours(country.totalEssentialLaborHours)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="inline-flex items-center justify-center font-bold text-xs px-2 py-0.5 rounded-md bg-chart-2/15 text-chart-2 border border-chart-2/20">
                              {country.appiEssentials}
                            </div>
                          </TableCell>
                        </>
                      )}

                      {/* LUXURY CELLS */}
                      {pillarView === "luxury" && (
                        <>
                          <TableCell className="text-right text-xs">
                            <div className="font-semibold text-foreground">{formatPercent(country.medicalCheckupPercentOfWage)}</div>
                            <div className="text-[10px] text-muted-foreground">${country.medicalCheckupUSD.toFixed(1)}</div>
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            <div className="font-semibold text-foreground">{country.carLaborMonths.toFixed(1)} mo</div>
                            <div className="text-[10px] text-muted-foreground">${country.carPriceUSD.toFixed(0)}</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="inline-flex items-center justify-center font-bold text-xs px-2 py-0.5 rounded-md bg-chart-4/15 text-chart-4 border border-chart-4/20">
                              {country.appiLuxury}
                            </div>
                          </TableCell>
                        </>
                      )}

                      {/* FOOD CELLS */}
                      {pillarView === "food" && (
                        <>
                          <TableCell className="text-right text-xs">
                            <div className="font-medium">{formatCurrency(country.monthlyBasketCostUSD, "USD")}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {formatCurrency(country.monthlyBasketCostLocal, country.currencyCode)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-xs font-bold">
                            <span className={country.basketPercentOfWage < 10 ? "text-emerald-500" : country.basketPercentOfWage < 20 ? "text-amber-500" : country.basketPercentOfWage < 35 ? "text-orange-500" : "text-rose-500"}>
                              {formatPercent(country.basketPercentOfWage)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-xs font-semibold text-primary">
                            {formatHours(country.laborHoursForBasket)}
                          </TableCell>
                        </>
                      )}

                      {/* RENT CELLS */}
                      {pillarView === "rent" && (
                        <>
                          <TableCell className="text-right text-xs">
                            <div className="font-medium">${country.rentMonthlyUSD.toFixed(0)}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {formatCurrency(country.rentMonthlyLocal, country.currencyCode)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-xs font-bold text-chart-2">
                            {formatPercent(country.rentPercentOfWage)}
                          </TableCell>
                          <TableCell className="text-right text-xs font-semibold text-primary">
                            {formatHours(country.rentLaborHours)}
                          </TableCell>
                        </>
                      )}

                      {/* CAR CELLS */}
                      {pillarView === "car" && (
                        <>
                          <TableCell className="text-right text-xs">
                            <div className="font-medium">${country.carPriceUSD.toFixed(0)}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {formatCurrency(country.carPriceLocal, country.currencyCode)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-xs font-bold text-chart-4">
                            {country.carLaborMonths.toFixed(1)} months
                          </TableCell>
                        </>
                      )}

                      {/* MEDICAL CELLS */}
                      {pillarView === "medical" && (
                        <>
                          <TableCell className="text-right text-xs">
                            <div className="font-medium">${country.medicalCheckupUSD.toFixed(1)}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {formatCurrency(country.medicalCheckupLocal, country.currencyCode)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-xs font-bold text-rose-500">
                            {formatPercent(country.medicalCheckupPercentOfWage)}
                          </TableCell>
                          <TableCell className="text-right text-xs font-semibold text-primary">
                            {formatHours(country.medicalCheckupLaborHours)}
                          </TableCell>
                        </>
                      )}

                      <TableCell className="text-center">
                        <Badge variant={tierBadgeVariant(country.stressTier)} className="text-[10px]">
                          {country.stressTier}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a href={getBasePath(`compare?c1=${country.id}&c2=world-average`)}>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px]">
                              Compare
                            </Button>
                          </a>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* EXPANDED ROW: Granular Multi-Pillar & APPI Breakdown */}
                    {isExpanded && (
                      <TableRow className="bg-muted/15">
                        <TableCell colSpan={10} className="p-4">
                          <div className="rounded-xl border border-border/60 bg-background/60 p-4 flex flex-col gap-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-foreground">
                                  {country.flag} {country.name} — Full Economic Pillar & APPI Breakdown
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  (Hourly median wage: {formatCurrency(country.hourlyMedianWageUSD, "USD")}/hr)
                                </span>
                              </div>
                              <span className="text-[10px] text-muted-foreground">
                                Source: {country.wageSource} & {country.priceSource}
                              </span>
                            </div>

                            {/* APPI Composite Score Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                              <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 flex flex-col justify-between">
                                <div className="text-xs font-bold text-primary flex items-center justify-between">
                                  <span>Composite APPI (70/30)</span>
                                  <span className="text-base font-extrabold">{country.appiScore} / 100</span>
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-1">
                                  70% APPI Essentials ({country.appiEssentials}) + 30% APPI Luxury ({country.appiLuxury})
                                </div>
                              </div>

                              <div className="p-3 rounded-lg border border-chart-2/30 bg-chart-2/5 flex flex-col justify-between">
                                <div className="text-xs font-bold text-chart-2 flex items-center justify-between">
                                  <span>APPI Essentials</span>
                                  <span className="text-base font-extrabold">{country.appiEssentials} / 100</span>
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-1">
                                  Food ({formatPercent(country.basketPercentOfWage)}) + Rent ({formatPercent(country.rentPercentOfWage)})
                                </div>
                              </div>

                              <div className="p-3 rounded-lg border border-chart-4/30 bg-chart-4/5 flex flex-col justify-between">
                                <div className="text-xs font-bold text-chart-4 flex items-center justify-between">
                                  <span>APPI Luxury</span>
                                  <span className="text-base font-extrabold">{country.appiLuxury} / 100</span>
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-1">
                                  Health ({country.medicalCheckupLaborHours.toFixed(1)}h) + Car ({country.carLaborMonths.toFixed(1)} mos)
                                </div>
                              </div>
                            </div>

                            {/* 4 Pillars Summary Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                              <div className="p-2.5 rounded-lg border border-border/60 bg-card flex flex-col justify-between">
                                <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                                  <Utensils className="size-3 text-primary" /> Monthly Food
                                </span>
                                <div className="text-sm font-extrabold text-foreground mt-1">${country.monthlyBasketCostUSD.toFixed(1)}</div>
                                <div className="text-[10px] text-muted-foreground">{country.laborHoursForBasket.toFixed(1)} hours ({country.basketPercentOfWage.toFixed(1)}%)</div>
                              </div>

                              <div className="p-2.5 rounded-lg border border-border/60 bg-card flex flex-col justify-between">
                                <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                                  <Home className="size-3 text-chart-2" /> 1-BR Apartment Rent
                                </span>
                                <div className="text-sm font-extrabold text-foreground mt-1">${country.rentMonthlyUSD.toFixed(0)}</div>
                                <div className="text-[10px] text-muted-foreground">{country.rentLaborHours.toFixed(1)} hours ({country.rentPercentOfWage.toFixed(1)}%)</div>
                              </div>

                              <div className="p-2.5 rounded-lg border border-border/60 bg-card flex flex-col justify-between">
                                <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                                  <Car className="size-3 text-chart-4" /> Standard New Car
                                </span>
                                <div className="text-sm font-extrabold text-foreground mt-1">${country.carPriceUSD.toFixed(0)}</div>
                                <div className="text-[10px] text-muted-foreground">{country.carLaborMonths.toFixed(1)} months of wage</div>
                              </div>

                              <div className="p-2.5 rounded-lg border border-border/60 bg-card flex flex-col justify-between">
                                <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                                  <Stethoscope className="size-3 text-rose-500" /> Medical Checkup
                                </span>
                                <div className="text-sm font-extrabold text-foreground mt-1">${country.medicalCheckupUSD.toFixed(1)}</div>
                                <div className="text-[10px] text-muted-foreground">{country.medicalCheckupLaborHours.toFixed(1)} hours ({country.medicalCheckupPercentOfWage.toFixed(1)}%)</div>
                              </div>
                            </div>

                            {/* Estimation Disclaimer Callout */}
                            {country.isEstimated && country.estimationDisclaimer && (
                              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400 space-y-1">
                                <div className="font-bold flex items-center gap-1.5">
                                  <span>⚠️ Econometric Estimation Disclaimer</span>
                                </div>
                                <p className="text-[11px] leading-relaxed">
                                  {country.estimationDisclaimer}
                                </p>
                              </div>
                            )}

                            {/* 13 Item Food Basket */}
                            <div className="text-[11px] font-semibold text-foreground mt-1">Itemized Food Basket Minutes:</div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
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

      {/* Dataset & Estimation Transparency Banner */}
      <Card className="border-border/80 bg-card/60 p-4 rounded-xl text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <span className="size-2 rounded-full bg-primary" />
          <span>Global 195 Nations Coverage & Multi-Pillar Standards</span>
        </div>
        <p className="leading-relaxed">
          AtlasIndex calculates genuine purchasing power across all 195 sovereign nations using the composite <strong>APPI Standard (70% APPI Essentials: Food + 1-BR Rent, 30% APPI Luxury: Healthcare Checkup + Passenger Car)</strong> compared to the unified 🌐 World Average benchmark.
        </p>
      </Card>
    </div>
  );
}
