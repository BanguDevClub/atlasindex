import React, { useState, useMemo } from "react";
import { RAW_COUNTRIES } from "@/data/countries";
import { getAllProcessedCountries, getWorldAverageCountry } from "@/lib/methodology";
import { Card } from "@/components/ui/card";
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
import { formatCurrency, formatHours, formatPercent, formatMinutes, getBasePath } from "@/lib/utils";

import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/SearchableSelect";
import {
  Search,
  Download,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  Utensils,
  Home,
  Car,
  Stethoscope,
  Layers,
  Globe,
  Filter,
} from "lucide-react";

type PillarView = "overview" | "food" | "rent" | "car" | "medical" | "combined";

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
        field === "totalPercent"
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
  }, [allCountries, searchQuery, selectedContinent, selectedTier, dataFilter, sortField, sortAsc]);

  const tierBadgeVariant = (tier?: string) => {
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
      "Food_Basket_USD",
      "Food_Percent_Wage",
      "Food_Labor_Hours",
      "Rent_1BR_USD",
      "Rent_Percent_Wage",
      "Rent_Labor_Hours",
      "Car_Price_USD",
      "Car_Labor_Months",
      "Medical_Checkup_USD",
      "Medical_Percent_Wage",
      "Medical_Labor_Hours",
      "Total_Essential_USD",
      "Total_Essential_Percent_Wage",
      "APPI_Score",
      "Stress_Tier",
      "Is_Estimated",
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
      c.monthlyBasketCostUSD.toFixed(2),
      c.basketPercentOfWage.toFixed(2),
      c.laborHoursForBasket.toFixed(2),
      c.rentMonthlyUSD.toFixed(2),
      c.rentPercentOfWage.toFixed(2),
      c.rentLaborHours.toFixed(2),
      c.carPriceUSD.toFixed(2),
      c.carLaborMonths.toFixed(2),
      c.medicalCheckupUSD.toFixed(2),
      c.medicalCheckupPercentOfWage.toFixed(2),
      c.medicalCheckupLaborHours.toFixed(2),
      c.totalEssentialMonthlyCostUSD.toFixed(2),
      c.totalEssentialPercentOfWage.toFixed(2),
      c.appiScore,
      c.stressTier,
      c.isEstimated ? "YES" : "NO",
      `"${c.wageSource}"`,
      `"${c.priceSource}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `atlasindex_multi_pillar_rankings_2025.csv`);
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
            Every country in the world ranked across <strong>Food, Housing (Rent), Transport (Car), and Healthcare (Checkups)</strong> compared to the Global Average.
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
          <span>All Pillars Overview</span>
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
          <span>Car Purchase</span>
        </Button>
        <Button
          variant={pillarView === "medical" ? "default" : "outline"}
          size="sm"
          onClick={() => setPillarView("medical")}
          className="text-xs h-8 px-3 gap-1.5"
        >
          <Stethoscope className="size-3.5" />
          <span>Medical Checkup</span>
        </Button>
        <Button
          variant={pillarView === "combined" ? "default" : "outline"}
          size="sm"
          onClick={() => setPillarView("combined")}
          className="text-xs h-8 px-3 gap-1.5"
        >
          <Layers className="size-3.5" />
          <span>Essential (Food + Rent)</span>
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

      {/* Mobile Horizontal Scroll Tip */}
      <div className="flex sm:hidden items-center justify-between px-1 text-[11px] text-muted-foreground">
        <span>Showing {filteredAndSortedCountries.length} countries</span>
        <span className="font-semibold text-primary">← Swipe table horizontally →</span>
      </div>

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

              {/* OVERVIEW MODE COLUMNS */}
              {pillarView === "overview" && (
                <>
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort("basketPercent")}>
                    <div className="flex items-center justify-end gap-1">
                      <span>Food (% / hr)</span>
                      {sortField === "basketPercent" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort("rentPercent")}>
                    <div className="flex items-center justify-end gap-1">
                      <span>1-BR Rent (% / mo)</span>
                      {sortField === "rentPercent" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort("carMonths")}>
                    <div className="flex items-center justify-end gap-1">
                      <span>Car (Months)</span>
                      {sortField === "carMonths" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort("medicalHours")}>
                    <div className="flex items-center justify-end gap-1">
                      <span>Medical (hrs)</span>
                      {sortField === "medicalHours" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-center" onClick={() => handleSort("appiScore")}>
                    <div className="flex items-center justify-center gap-1">
                      <span>APPI</span>
                      {sortField === "appiScore" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                    </div>
                  </TableHead>
                </>
              )}

              {/* FOOD MODE COLUMNS */}
              {pillarView === "food" && (
                <>
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort("basketUSD")}>
                    <div className="flex items-center justify-end gap-1">
                      <span>Food Basket Cost</span>
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
                      <span>Labor Hours</span>
                      {sortField === "laborHours" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-center" onClick={() => handleSort("appiScore")}>
                    <div className="flex items-center justify-center gap-1">
                      <span>APPI Score</span>
                      {sortField === "appiScore" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                    </div>
                  </TableHead>
                </>
              )}

              {/* RENT MODE COLUMNS */}
              {pillarView === "rent" && (
                <>
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort("rentUSD")}>
                    <div className="flex items-center justify-end gap-1">
                      <span>1-BR Rent ($)</span>
                      {sortField === "rentUSD" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort("rentPercent")}>
                    <div className="flex items-center justify-end gap-1">
                      <span>Rent Share (%)</span>
                      {sortField === "rentPercent" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort("rentHours")}>
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
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort("carUSD")}>
                    <div className="flex items-center justify-end gap-1">
                      <span>New Car Retail ($)</span>
                      {sortField === "carUSD" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort("carMonths")}>
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
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort("medicalUSD")}>
                    <div className="flex items-center justify-end gap-1">
                      <span>Checkup Exam ($)</span>
                      {sortField === "medicalUSD" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort("medicalPercent")}>
                    <div className="flex items-center justify-end gap-1">
                      <span>Wage Share (%)</span>
                      {sortField === "medicalPercent" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort("medicalHours")}>
                    <div className="flex items-center justify-end gap-1">
                      <span>Labor Hours</span>
                      {sortField === "medicalHours" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                    </div>
                  </TableHead>
                </>
              )}

              {/* COMBINED MODE COLUMNS */}
              {pillarView === "combined" && (
                <>
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort("totalPercent")}>
                    <div className="flex items-center justify-end gap-1">
                      <span>Essential Cost ($)</span>
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort("totalPercent")}>
                    <div className="flex items-center justify-end gap-1">
                      <span>Essential Wage Share (%)</span>
                      {sortField === "totalPercent" && (sortAsc ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort("laborHours")}>
                    <div className="flex items-center justify-end gap-1">
                      <span>Total Labor Hours</span>
                    </div>
                  </TableHead>
                </>
              )}

              <TableHead className="text-center">Tier</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* PINNED GLOBAL AVERAGE ROW */}
            <TableRow className="bg-primary/10 hover:bg-primary/15 border-b-2 border-primary/30 font-semibold text-xs">
              <TableCell className="font-bold text-primary">
                <Globe className="size-3.5 inline mr-1" /> Avg
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-base">{worldAvgCountry.flag}</span>
                  <div>
                    <span className="font-bold text-primary">{worldAvgCountry.name}</span>
                    <span className="text-[10px] text-muted-foreground block">Global 195 Nations Baseline</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right font-bold">
                ${worldAvgCountry.monthlyMedianWageUSD.toFixed(0)}/mo
              </TableCell>

              {pillarView === "overview" && (
                <>
                  <TableCell className="text-right font-bold text-primary">
                    {worldAvgCountry.basketPercentOfWage.toFixed(1)}% ({worldAvgCountry.laborHoursForBasket.toFixed(1)}h)
                  </TableCell>
                  <TableCell className="text-right font-bold text-chart-2">
                    ${worldAvgCountry.rentMonthlyUSD.toFixed(0)} ({worldAvgCountry.rentPercentOfWage.toFixed(1)}%)
                  </TableCell>
                  <TableCell className="text-right font-bold text-chart-4">
                    {worldAvgCountry.carLaborMonths.toFixed(1)} mos (${worldAvgCountry.carPriceUSD.toFixed(0)})
                  </TableCell>
                  <TableCell className="text-right font-bold text-rose-500">
                    {worldAvgCountry.medicalCheckupLaborHours.toFixed(1)}h (${worldAvgCountry.medicalCheckupUSD.toFixed(1)})
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="px-2 py-0.5 rounded bg-primary/20 text-primary font-bold text-xs">
                      {worldAvgCountry.appiScore}
                    </span>
                  </TableCell>
                </>
              )}

              {pillarView === "food" && (
                <>
                  <TableCell className="text-right font-bold">${worldAvgCountry.monthlyBasketCostUSD.toFixed(1)}</TableCell>
                  <TableCell className="text-right font-bold text-primary">{worldAvgCountry.basketPercentOfWage.toFixed(1)}%</TableCell>
                  <TableCell className="text-right font-bold">{worldAvgCountry.laborHoursForBasket.toFixed(1)}h</TableCell>
                  <TableCell className="text-center">
                    <span className="px-2 py-0.5 rounded bg-primary/20 text-primary font-bold text-xs">
                      {worldAvgCountry.appiScore}
                    </span>
                  </TableCell>
                </>
              )}

              {pillarView === "rent" && (
                <>
                  <TableCell className="text-right font-bold">${worldAvgCountry.rentMonthlyUSD.toFixed(0)}</TableCell>
                  <TableCell className="text-right font-bold text-chart-2">{worldAvgCountry.rentPercentOfWage.toFixed(1)}%</TableCell>
                  <TableCell className="text-right font-bold">{worldAvgCountry.rentLaborHours.toFixed(1)}h</TableCell>
                </>
              )}

              {pillarView === "car" && (
                <>
                  <TableCell className="text-right font-bold">${worldAvgCountry.carPriceUSD.toFixed(0)}</TableCell>
                  <TableCell className="text-right font-bold text-chart-4">{worldAvgCountry.carLaborMonths.toFixed(1)} mos</TableCell>
                </>
              )}

              {pillarView === "medical" && (
                <>
                  <TableCell className="text-right font-bold">${worldAvgCountry.medicalCheckupUSD.toFixed(1)}</TableCell>
                  <TableCell className="text-right font-bold text-rose-500">{worldAvgCountry.medicalCheckupPercentOfWage.toFixed(1)}%</TableCell>
                  <TableCell className="text-right font-bold">{worldAvgCountry.medicalCheckupLaborHours.toFixed(1)}h</TableCell>
                </>
              )}

              {pillarView === "combined" && (
                <>
                  <TableCell className="text-right font-bold">${worldAvgCountry.totalEssentialMonthlyCostUSD.toFixed(0)}</TableCell>
                  <TableCell className="text-right font-bold text-primary">{worldAvgCountry.totalEssentialPercentOfWage.toFixed(1)}%</TableCell>
                  <TableCell className="text-right font-bold">{worldAvgCountry.totalEssentialLaborHours.toFixed(1)}h</TableCell>
                </>
              )}

              <TableCell className="text-center">
                <Badge variant="outline" className="text-[10px] bg-primary/20 text-primary border-primary/30">
                  Global
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <a href={getBasePath(`compare?c1=world-average&c2=usa`)}>
                  <Button variant="outline" size="sm" className="h-6 px-2 text-[10px] bg-primary/20 text-primary border-primary/30">
                    Compare
                  </Button>
                </a>
              </TableCell>
            </TableRow>

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
                            <span className={country.basketPercentOfWage < 15 ? "text-emerald-500" : country.basketPercentOfWage < 35 ? "text-amber-500" : "text-rose-500"}>
                              {formatPercent(country.basketPercentOfWage)}
                            </span>
                            <span className="text-[10px] text-muted-foreground block">{formatHours(country.laborHoursForBasket)}</span>
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            <div className="font-medium text-foreground">${country.rentMonthlyUSD.toFixed(0)}</div>
                            <div className="text-[10px] text-muted-foreground">{formatPercent(country.rentPercentOfWage)}</div>
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            <div className="font-medium text-foreground">{country.carLaborMonths.toFixed(1)} mo</div>
                            <div className="text-[10px] text-muted-foreground">${country.carPriceUSD.toFixed(0)}</div>
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            <div className="font-medium text-foreground">{country.medicalCheckupLaborHours.toFixed(1)}h</div>
                            <div className="text-[10px] text-muted-foreground">${country.medicalCheckupUSD.toFixed(1)}</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="inline-flex items-center justify-center font-bold text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                              {country.appiScore}
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
                          <TableCell className="text-center">
                            <div className="inline-flex items-center justify-center font-bold text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                              {country.appiScore}
                            </div>
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

                      {/* COMBINED CELLS */}
                      {pillarView === "combined" && (
                        <>
                          <TableCell className="text-right text-xs">
                            <div className="font-medium">${country.totalEssentialMonthlyCostUSD.toFixed(0)}</div>
                            <div className="text-[10px] text-muted-foreground">Food + 1-BR Rent</div>
                          </TableCell>
                          <TableCell className="text-right text-xs font-bold text-primary">
                            {formatPercent(country.totalEssentialPercentOfWage)}
                          </TableCell>
                          <TableCell className="text-right text-xs font-semibold text-primary">
                            {formatHours(country.totalEssentialLaborHours)}
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

                    {/* EXPANDED ROW: Granular Multi-Pillar & Nutrition Breakdown */}
                    {isExpanded && (
                      <TableRow className="bg-muted/15">
                        <TableCell colSpan={10} className="p-4">
                          <div className="rounded-xl border border-border/60 bg-background/60 p-4 flex flex-col gap-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-foreground">
                                  {country.flag} {country.name} — Full Economic Pillar Breakdown
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  (Hourly median wage: {formatCurrency(country.hourlyMedianWageUSD, "USD")}/hr)
                                </span>
                              </div>
                              <span className="text-[10px] text-muted-foreground">
                                Source: {country.wageSource} & {country.priceSource}
                              </span>
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
      </Card>

      {/* Dataset & Estimation Transparency Banner */}
      <Card className="border-border/80 bg-card/60 p-4 rounded-xl text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <span className="size-2 rounded-full bg-primary" />
          <span>Global 195 Nations Coverage & Multi-Pillar Standards</span>
        </div>
        <p className="leading-relaxed">
          AtlasIndex standardizes nutritional and living purchasing power across all 193 UN member nations plus 2 permanent observer states. Housing measures a national weighted 1-bedroom apartment rent; Transport reflects an entry-level compact passenger vehicle retail purchase (e.g. Toyota Corolla / VW Golf); Healthcare reflects an uninsured comprehensive medical checkup (doctor consultation + CBC + lipid + metabolic panel).
        </p>
      </Card>
    </div>
  );
}
