import React, { useState, useMemo, useEffect } from "react";
import { RAW_COUNTRIES } from "@/data/countries";
import { BASKET_ITEMS } from "@/data/basketDefinition";
import {
  getAllProcessedCountries,
  getWorldAverageCountry,
  calculateAPPIEssentials,
  calculateAPPILuxury,
  calculateAPPIComposite,
  getStressTier,
} from "@/lib/methodology";
import type { ProcessedCountryEconomy } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/SearchableSelect";
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
} from "recharts";
import {
  SlidersHorizontal,
  Sparkles,
  Utensils,
  Home,
  Car,
  Stethoscope,
  Globe,
  Trophy,
  Share2,
  Download,
  RotateCcw,
  Check,
  Info,
  Clock,
  Coins,
  ChevronDown,
  ChevronUp,
  Scale,
} from "lucide-react";

interface ItemPriceInput {
  id: string;
  price: number;
}

export function AppiSandbox() {
  const allCountries = useMemo(() => getAllProcessedCountries(RAW_COUNTRIES), []);
  const worldAvgCountry = useMemo(() => getWorldAverageCountry(allCountries), [allCountries]);

  // Country Custom Profile State
  const [countryName, setCountryName] = useState<string>("My Custom Nation");
  const [countryFlag, setCountryFlag] = useState<string>("🏝️");
  const [currencySymbol, setCurrencySymbol] = useState<string>("$");

  // Core Economic Parameters State
  const [monthlyWage, setMonthlyWage] = useState<number>(3500);
  const [monthlyHours, setMonthlyHours] = useState<number>(160);
  const [basketCost, setBasketCost] = useState<number>(180);
  const [rentCost, setRentCost] = useState<number>(1100);
  const [carCost, setCarCost] = useState<number>(24000);
  const [medicalCost, setMedicalCost] = useState<number>(120);

  // Advanced Weighting Parameters
  const [essentialWeight, setEssentialWeight] = useState<number>(70); // 70% default
  const luxuryWeight = 100 - essentialWeight;

  // Food breakdown mode
  const [foodBasketMode, setFoodBasketMode] = useState<"total" | "itemized">("total");
  const [itemPrices, setItemPrices] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    BASKET_ITEMS.forEach((item) => {
      // Default approximate prices proportional to $180 basket
      initial[item.id] = Number((item.quantityInMonthlyBasket * 4.5).toFixed(2));
    });
    return initial;
  });

  // Comparison benchmark country selector
  const [benchmarkCountryId, setBenchmarkCountryId] = useState<string>("world-average");

  // Share link copy notification
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Quick Preset Handlers
  const applyPreset = (preset: {
    name: string;
    flag: string;
    wage: number;
    hours?: number;
    basket: number;
    rent: number;
    car: number;
    med: number;
  }) => {
    setCountryName(preset.name);
    setCountryFlag(preset.flag);
    setMonthlyWage(preset.wage);
    setMonthlyHours(preset.hours || 160);
    setBasketCost(preset.basket);
    setRentCost(preset.rent);
    setCarCost(preset.car);
    setMedicalCost(preset.med);
  };

  // Cloner from existing country
  const countrySelectOptions: SearchableSelectOption[] = useMemo(() => {
    return [
      {
        value: "world-average",
        label: `${worldAvgCountry.flag} ${worldAvgCountry.name}`,
        subtitle: `Wage: $${worldAvgCountry.monthlyMedianWageUSD.toFixed(0)} • APPI: ${worldAvgCountry.appiScore}`,
        group: "Benchmarks",
      },
      ...allCountries.map((c) => ({
        value: c.id,
        label: `${c.flag} ${c.name}`,
        subtitle: `Wage: $${c.monthlyMedianWageUSD.toFixed(0)} • APPI: ${c.appiScore} (#${c.rank})`,
        group: c.continent,
      })),
    ];
  }, [allCountries, worldAvgCountry]);

  const handleCloneCountry = (countryId: string) => {
    if (countryId === "world-average") {
      applyPreset({
        name: "World Average Clone",
        flag: "🌐",
        wage: worldAvgCountry.monthlyMedianWageUSD,
        basket: worldAvgCountry.monthlyBasketCostUSD,
        rent: worldAvgCountry.rentMonthlyUSD,
        car: worldAvgCountry.carPriceUSD,
        med: worldAvgCountry.medicalCheckupUSD,
      });
      return;
    }
    const found = allCountries.find((c) => c.id === countryId);
    if (found) {
      applyPreset({
        name: `${found.name} (Customized)`,
        flag: found.flag,
        wage: found.monthlyMedianWageUSD,
        basket: found.monthlyBasketCostUSD,
        rent: found.rentMonthlyUSD,
        car: found.carPriceUSD,
        med: found.medicalCheckupUSD,
      });
    }
  };

  // Update total basket cost if itemized prices change
  const updateItemPrice = (itemId: string, newPrice: number) => {
    const nextPrices = { ...itemPrices, [itemId]: Math.max(0, newPrice) };
    setItemPrices(nextPrices);
    const sum = BASKET_ITEMS.reduce((acc, item) => {
      return acc + (nextPrices[item.id] || 0) * item.quantityInMonthlyBasket;
    }, 0);
    setBasketCost(Number(sum.toFixed(2)));
  };

  // Read URL parameters on initial mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.has("wage")) setMonthlyWage(Number(params.get("wage")) || 3500);
    if (params.has("basket")) setBasketCost(Number(params.get("basket")) || 180);
    if (params.has("rent")) setRentCost(Number(params.get("rent")) || 1100);
    if (params.has("car")) setCarCost(Number(params.get("car")) || 24000);
    if (params.has("med")) setMedicalCost(Number(params.get("med")) || 120);
    if (params.has("hours")) setMonthlyHours(Number(params.get("hours")) || 160);
    if (params.has("name")) setCountryName(params.get("name") || "My Custom Nation");
    if (params.has("flag")) setCountryFlag(params.get("flag") || "🏝️");
    if (params.has("ew")) setEssentialWeight(Number(params.get("ew")) || 70);
  }, []);

  // Compute Live Metrics
  const hourlyWage = monthlyWage / (monthlyHours || 160);

  // Pillar 1: Food
  const foodWagePercent = monthlyWage > 0 ? (basketCost / monthlyWage) * 100 : 0;
  const foodLaborHours = hourlyWage > 0 ? basketCost / hourlyWage : 0;

  // Pillar 2: Rent
  const rentWagePercent = monthlyWage > 0 ? (rentCost / monthlyWage) * 100 : 0;
  const rentLaborHours = hourlyWage > 0 ? rentCost / hourlyWage : 0;

  // Essentials Combined
  const totalEssentialCost = basketCost + rentCost;
  const totalEssentialPercent = foodWagePercent + rentWagePercent;
  const totalEssentialLaborHours = foodLaborHours + rentLaborHours;

  // Pillar 3: Car
  const carLaborMonths = monthlyWage > 0 ? carCost / monthlyWage : 0;
  const carLaborHours = carLaborMonths * (monthlyHours || 160);

  // Pillar 4: Healthcare
  const medicalWagePercent = monthlyWage > 0 ? (medicalCost / monthlyWage) * 100 : 0;
  const medicalLaborHours = hourlyWage > 0 ? medicalCost / hourlyWage : 0;

  // APPI Calculations
  const appiEssentials = calculateAPPIEssentials(totalEssentialPercent, totalEssentialLaborHours);
  const appiLuxury = calculateAPPILuxury(carLaborMonths, medicalWagePercent);

  // APPI Composite with custom weights
  const customAppiScore = useMemo(() => {
    const essPart = (essentialWeight / 100) * appiEssentials;
    const luxPart = (luxuryWeight / 100) * appiLuxury;
    return Math.min(100, Math.max(1, Math.round(essPart + luxPart)));
  }, [essentialWeight, luxuryWeight, appiEssentials, appiLuxury]);

  const stressTier = getStressTier(customAppiScore);

  // Remaining Disposable Income
  const disposableWage = Math.max(0, monthlyWage - totalEssentialCost);
  const disposablePercent = monthlyWage > 0 ? (disposableWage / monthlyWage) * 100 : 0;
  const freeLaborHours = Math.max(0, monthlyHours - totalEssentialLaborHours);

  // Simulated Global Rank Calculation
  const simulatedRank = useMemo(() => {
    const scores = allCountries.map((c) => c.appiScore);
    // Find index of first country with score <= customAppiScore
    let rank = 1;
    for (const country of allCountries) {
      if (customAppiScore < country.appiScore) {
        rank++;
      } else if (customAppiScore === country.appiScore) {
        if (totalEssentialPercent > country.totalEssentialPercentOfWage) {
          rank++;
        }
      }
    }
    return rank;
  }, [allCountries, customAppiScore, totalEssentialPercent]);

  // Selected benchmark country for comparison
  const benchmarkCountry: ProcessedCountryEconomy = useMemo(() => {
    if (benchmarkCountryId === "world-average") {
      return worldAvgCountry as ProcessedCountryEconomy;
    }
    return allCountries.find((c) => c.id === benchmarkCountryId) || (worldAvgCountry as ProcessedCountryEconomy);
  }, [benchmarkCountryId, allCountries, worldAvgCountry]);

  // Comparison Chart Data
  const chartData = [
    {
      name: "APPI Score",
      [countryName]: customAppiScore,
      [benchmarkCountry.name]: benchmarkCountry.appiScore,
      "World Avg": worldAvgCountry.appiScore,
    },
    {
      name: "Essentials Score",
      [countryName]: appiEssentials,
      [benchmarkCountry.name]: benchmarkCountry.appiEssentials,
      "World Avg": worldAvgCountry.appiEssentials,
    },
    {
      name: "Luxury Score",
      [countryName]: appiLuxury,
      [benchmarkCountry.name]: benchmarkCountry.appiLuxury,
      "World Avg": worldAvgCountry.appiLuxury,
    },
    {
      name: "Essentials Wage (%)",
      [countryName]: Number(totalEssentialPercent.toFixed(1)),
      [benchmarkCountry.name]: Number(benchmarkCountry.totalEssentialPercentOfWage.toFixed(1)),
      "World Avg": Number(worldAvgCountry.totalEssentialPercentOfWage.toFixed(1)),
    },
    {
      name: "Essentials Effort (hrs)",
      [countryName]: Number(totalEssentialLaborHours.toFixed(1)),
      [benchmarkCountry.name]: Number(benchmarkCountry.totalEssentialLaborHours.toFixed(1)),
      "World Avg": Number(worldAvgCountry.totalEssentialLaborHours.toFixed(1)),
    },
    {
      name: "Car Purchase (Mos)",
      [countryName]: Number(carLaborMonths.toFixed(1)),
      [benchmarkCountry.name]: Number(benchmarkCountry.carLaborMonths.toFixed(1)),
      "World Avg": Number(worldAvgCountry.carLaborMonths.toFixed(1)),
    },
  ];

  // Copy shareable link
  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.origin + getBasePath("/sandbox"));
    url.searchParams.set("name", countryName);
    url.searchParams.set("flag", countryFlag);
    url.searchParams.set("wage", monthlyWage.toString());
    url.searchParams.set("hours", monthlyHours.toString());
    url.searchParams.set("basket", basketCost.toString());
    url.searchParams.set("rent", rentCost.toString());
    url.searchParams.set("car", carCost.toString());
    url.searchParams.set("med", medicalCost.toString());
    if (essentialWeight !== 70) url.searchParams.set("ew", essentialWeight.toString());

    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Export JSON Profile
  const handleExportJSON = () => {
    const profile = {
      meta: {
        app: "AtlasIndex APPI Sandbox",
        version: "2025.1",
        exportedAt: new Date().toISOString(),
      },
      country: {
        name: countryName,
        flag: countryFlag,
        currency: currencySymbol,
      },
      laborAndWages: {
        monthlyMedianWageUSD: monthlyWage,
        monthlyHoursBenchmark: monthlyHours,
        hourlyWageUSD: hourlyWage,
      },
      pillars: {
        nutritionMonthlyUSD: basketCost,
        foodWagePercent: foodWagePercent,
        foodLaborHours: foodLaborHours,
        housing1BRRentUSD: rentCost,
        rentWagePercent: rentWagePercent,
        rentLaborHours: rentLaborHours,
        essentialCombinedCostUSD: totalEssentialCost,
        essentialCombinedWagePercent: totalEssentialPercent,
        essentialCombinedLaborHours: totalEssentialLaborHours,
        transportNewCarUSD: carCost,
        carLaborMonths: carLaborMonths,
        carLaborHours: carLaborHours,
        healthcareBloodCheckupUSD: medicalCost,
        healthcareWagePercent: medicalWagePercent,
        healthcareLaborHours: medicalLaborHours,
      },
      indexScores: {
        compositeAPPI: customAppiScore,
        appiEssentials: appiEssentials,
        appiLuxury: appiLuxury,
        stressTier: stressTier,
        simulatedGlobalRank: simulatedRank,
        weightsApplied: {
          essentialsPercent: essentialWeight,
          luxuryPercent: luxuryWeight,
        },
      },
    };

    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `${countryName.toLowerCase().replace(/\s+/g, "-")}-appi-profile.json`;
    a.click();
    URL.revokeObjectURL(href);
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" className="text-xs bg-primary/10 border-primary/20 text-primary gap-1">
              <SlidersHorizontal className="size-3.5" />
              <span>Interactive APPI Simulator</span>
            </Badge>
            <span className="text-xs text-muted-foreground">• Real-Time Macroeconomic Sandbox</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            APPI Custom Country Sandbox
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-3xl">
            Tweak wages, 13-item grocery costs, residential rent, vehicle prices, and healthcare checkups to simulate any theoretical, national, or regional economy.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="text-xs gap-1.5 border-border/80 bg-card/60 backdrop-blur"
          >
            {copiedLink ? <Check className="size-3.5 text-emerald-500" /> : <Share2 className="size-3.5" />}
            <span>{copiedLink ? "Link Copied!" : "Share Sandbox"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            className="text-xs gap-1.5 border-border/80 bg-card/60 backdrop-blur"
          >
            <Download className="size-3.5" />
            <span>Export JSON</span>
          </Button>
        </div>
      </div>

      {/* Quick Templates & Cloner Bar */}
      <Card className="border-border/80 bg-card/60 backdrop-blur p-4 rounded-2xl space-y-3 relative z-30 overflow-visible">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="size-3.5 text-primary" />
            <span>Quick Start Templates & Cloner</span>
          </span>
          <span className="text-[11px] text-muted-foreground">Load any archetype or real-world nation</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              applyPreset({
                name: "🌟 Utopia (100/100)",
                flag: "🌟",
                wage: 10000,
                basket: 15,
                rent: 35,
                car: 3000,
                med: 10,
              })
            }
            className="text-[11px] h-8 justify-start bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 truncate"
          >
            🌟 Ideal Utopia (100)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              applyPreset({
                name: "United States (Rank #1)",
                flag: "🇺🇸",
                wage: 4187,
                basket: 217.55,
                rent: 1450,
                car: 25500,
                med: 350,
              })
            }
            className="text-[11px] h-8 justify-start hover:bg-primary/10 text-foreground truncate"
          >
            🇺🇸 USA Baseline (71)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              applyPreset({
                name: "Switzerland (Rank #40)",
                flag: "🇨🇭",
                wage: 6615,
                basket: 436.49,
                rent: 3102,
                car: 36084,
                med: 290,
              })
            }
            className="text-[11px] h-8 justify-start hover:bg-primary/10 text-foreground truncate"
          >
            🇨🇭 Switzerland (64)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              applyPreset({
                name: "Poland (Tier 2)",
                flag: "🇵🇱",
                wage: 1569,
                basket: 126.42,
                rent: 798,
                car: 34565,
                med: 100,
              })
            }
            className="text-[11px] h-8 justify-start hover:bg-primary/10 text-foreground truncate"
          >
            🇵🇱 Poland (56)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              applyPreset({
                name: "Brazil (Tier 3)",
                flag: "🇧🇷",
                wage: 394,
                basket: 95.67,
                rent: 249,
                car: 21747,
                med: 63,
              })
            }
            className="text-[11px] h-8 justify-start hover:bg-primary/10 text-foreground truncate"
          >
            🇧🇷 Brazil (28)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              applyPreset({
                name: "World Average Baseline",
                flag: "🌐",
                wage: 1001.6,
                basket: 139.8,
                rent: 411.7,
                car: 23791.7,
                med: 75.7,
              })
            }
            className="text-[11px] h-8 justify-start hover:bg-primary/10 text-foreground truncate"
          >
            🌐 World Average (20)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              applyPreset({
                name: "Nigeria (Tier 4)",
                flag: "🇳🇬",
                wage: 66,
                basket: 81.42,
                rent: 37,
                car: 21304,
                med: 22,
              })
            }
            className="text-[11px] h-8 justify-start bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30 truncate"
          >
            🇳🇬 Nigeria (3)
          </Button>
        </div>

        {/* Dropdown Cloner */}
        <div className="pt-2 border-t border-border/40 flex flex-col sm:flex-row sm:items-center gap-3 relative z-30">
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
            Clone from any real country:
          </span>
          <div className="w-full sm:max-w-md relative z-30">
            <SearchableSelect
              options={countrySelectOptions}
              value=""
              onChange={handleCloneCountry}
              placeholder="Select a country to clone its exact 4 pillars..."
              searchPlaceholder="Type country name or ISO code..."
              size="sm"
              ariaLabel="Clone country parameters"
            />
          </div>
        </div>
      </Card>

      {/* Main 2-Column Grid: Controls & Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        {/* LEFT COLUMN (7 Cols): Tweakable Parameter Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Identity & Currency Card */}
          <Card className="border-border/80 bg-card/60 backdrop-blur p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Globe className="size-4 text-primary" />
                <span>1. Country Identity & Working Hours</span>
              </h3>
              <Badge variant="outline" className="text-[10px]">Setup</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-semibold text-muted-foreground">Country / Economy Name</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={countryFlag}
                    onChange={(e) => setCountryFlag(e.target.value)}
                    className="w-12 text-center text-base p-1"
                    title="Flag Emoji"
                  />
                  <Input
                    value={countryName}
                    onChange={(e) => setCountryName(e.target.value)}
                    className="flex-1 font-semibold text-sm"
                    placeholder="Enter custom country name..."
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Monthly Work Hours</label>
                <Input
                  type="number"
                  min="40"
                  max="300"
                  value={monthlyHours}
                  onChange={(e) => setMonthlyHours(Math.max(1, Number(e.target.value)))}
                  className="font-mono text-sm"
                />
                <span className="text-[10px] text-muted-foreground block">Default: 160h (40h/wk)</span>
              </div>
            </div>
          </Card>

          {/* Wage Card */}
          <Card className="border-border/80 bg-card/60 backdrop-blur p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Coins className="size-4 text-primary" />
                  <span>2. Median Net Take-Home Wage (W<sub>median</sub>)</span>
                </h3>
                <span className="text-xs text-muted-foreground">Monthly disposable earnings after standard income taxes</span>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-primary">${monthlyWage.toLocaleString()}</span>
                <span className="text-[10px] text-muted-foreground block font-mono">
                  ${hourlyWage.toFixed(2)}/hour
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <Slider
                  min={10}
                  max={12000}
                  step={25}
                  value={[monthlyWage]}
                  onValueChange={(val) => setMonthlyWage(val[0])}
                  className="flex-1"
                />
                <Input
                  type="number"
                  min="1"
                  max="50000"
                  value={monthlyWage}
                  onChange={(e) => setMonthlyWage(Math.max(1, Number(e.target.value)))}
                  className="w-28 text-right font-mono font-bold text-sm"
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>$10/mo (Extreme Strain)</span>
                <span>$1,002/mo (World Avg)</span>
                <span>$4,187/mo (USA)</span>
                <span>$12,000/mo</span>
              </div>
            </div>
          </Card>

          {/* Pillar 1: Nutrition / Food Basket */}
          <Card className="border-border/80 bg-card/60 backdrop-blur p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Utensils className="size-4 text-chart-1" />
                  <span>3. Pillar 1: Monthly Nutrition Basket (B)</span>
                </h3>
                <span className="text-xs text-muted-foreground">Standard 13-item adult nutritional baseline (~2,300 kcal/day)</span>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-chart-1">${basketCost.toFixed(2)}</span>
                <span className="text-[10px] text-muted-foreground block font-mono">
                  {foodWagePercent.toFixed(1)}% of wage • {foodLaborHours.toFixed(1)}h labor
                </span>
              </div>
            </div>

            <Tabs value={foodBasketMode} onValueChange={(v) => setFoodBasketMode(v as any)}>
              <div className="flex items-center justify-between mb-2">
                <TabsList className="h-7 text-xs">
                  <TabsTrigger value="total" className="text-xs px-2.5 h-6">Simple Cost Slider</TabsTrigger>
                  <TabsTrigger value="itemized" className="text-xs px-2.5 h-6">13 Food Items Breakdown</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="total" className="space-y-2 mt-0">
                <div className="flex items-center gap-4">
                  <Slider
                    min={10}
                    max={800}
                    step={5}
                    value={[basketCost]}
                    onValueChange={(val) => setBasketCost(val[0])}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min="1"
                    max="5000"
                    value={basketCost}
                    onChange={(e) => setBasketCost(Math.max(1, Number(e.target.value)))}
                    className="w-28 text-right font-mono font-bold text-sm"
                  />
                </div>
              </TabsContent>

              <TabsContent value="itemized" className="space-y-3 mt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs max-h-56 overflow-y-auto pr-1">
                  {BASKET_ITEMS.map((item) => (
                    <div key={item.id} className="p-2 rounded-lg bg-background/70 border border-border/40 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold truncate text-[11px]">{item.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{item.quantityInMonthlyBasket}x</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-muted-foreground">$</span>
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={itemPrices[item.id] || 0}
                          onChange={(e) => updateItemPrice(item.id, Number(e.target.value))}
                          className="h-6 text-xs p-1 text-right font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Pillar 2: Residential Housing */}
          <Card className="border-border/80 bg-card/60 backdrop-blur p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Home className="size-4 text-chart-2" />
                  <span>4. Pillar 2: 1-Bedroom Apartment Rent (R<sub>1BR</sub>)</span>
                </h3>
                <span className="text-xs text-muted-foreground">National median monthly residential tenancy contract</span>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-chart-2">${rentCost.toLocaleString()}</span>
                <span className="text-[10px] text-muted-foreground block font-mono">
                  {rentWagePercent.toFixed(1)}% of wage • {rentLaborHours.toFixed(1)}h labor
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <Slider
                  min={20}
                  max={4500}
                  step={20}
                  value={[rentCost]}
                  onValueChange={(val) => setRentCost(val[0])}
                  className="flex-1"
                />
                <Input
                  type="number"
                  min="1"
                  max="20000"
                  value={rentCost}
                  onChange={(e) => setRentCost(Math.max(0, Number(e.target.value)))}
                  className="w-28 text-right font-mono font-bold text-sm"
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>$20/mo (Lowest)</span>
                <span>$399/mo (World Avg)</span>
                <span>$1,450/mo (USA)</span>
                <span>$4,500/mo</span>
              </div>
            </div>
          </Card>

          {/* Pillar 3: Transport / Passenger Car */}
          <Card className="border-border/80 bg-card/60 backdrop-blur p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Car className="size-4 text-chart-4" />
                  <span>5. Pillar 3: Compact Passenger Car MSRP (P<sub>car</sub>)</span>
                </h3>
                <span className="text-xs text-muted-foreground">Standard new passenger vehicle (C-segment: Corolla/Golf equivalent)</span>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-chart-4">${carCost.toLocaleString()}</span>
                <span className="text-[10px] text-muted-foreground block font-mono">
                  {carLaborMonths.toFixed(1)} months of median pay
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <Slider
                  min={2000}
                  max={50000}
                  step={500}
                  value={[carCost]}
                  onValueChange={(val) => setCarCost(val[0])}
                  className="flex-1"
                />
                <Input
                  type="number"
                  min="500"
                  max="150000"
                  value={carCost}
                  onChange={(e) => setCarCost(Math.max(0, Number(e.target.value)))}
                  className="w-28 text-right font-mono font-bold text-sm"
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>$2,000 (Minimal)</span>
                <span>$22,682 (World Avg)</span>
                <span>$25,500 (USA)</span>
                <span>$50,000</span>
              </div>
            </div>
          </Card>

          {/* Pillar 4: Healthcare Diagnostic Checkup */}
          <Card className="border-border/80 bg-card/60 backdrop-blur p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Stethoscope className="size-4 text-rose-500" />
                  <span>6. Pillar 4: Medical Blood Checkup (C<sub>checkup</sub>)</span>
                </h3>
                <span className="text-xs text-muted-foreground">Outpatient routine physician visit + complete diagnostic blood panels</span>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-rose-500">${medicalCost.toFixed(2)}</span>
                <span className="text-[10px] text-muted-foreground block font-mono">
                  {medicalWagePercent.toFixed(1)}% of wage • {medicalLaborHours.toFixed(1)}h labor
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <Slider
                  min={5}
                  max={800}
                  step={5}
                  value={[medicalCost]}
                  onValueChange={(val) => setMedicalCost(val[0])}
                  className="flex-1"
                />
                <Input
                  type="number"
                  min="1"
                  max="5000"
                  value={medicalCost}
                  onChange={(e) => setMedicalCost(Math.max(0, Number(e.target.value)))}
                  className="w-28 text-right font-mono font-bold text-sm"
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>$5 (Subsidized)</span>
                <span>$74.40 (World Avg)</span>
                <span>$350 (USA Outpatient)</span>
                <span>$800</span>
              </div>
            </div>
          </Card>

          {/* Advanced Weighting Settings */}
          <Card className="border-border/80 bg-card/60 backdrop-blur p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Scale className="size-4 text-primary" />
                <span>7. APPI Weighting Blend (Official Standard: 70% / 30%)</span>
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEssentialWeight(70)}
                className="h-6 text-[10px] text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3 mr-1" /> Reset to 70/30
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between font-mono">
                <span className="text-chart-2 font-bold">🍚🏠 Essentials: {essentialWeight}%</span>
                <span className="text-chart-4 font-bold">🚗🩺 Luxury: {luxuryWeight}%</span>
              </div>
              <Slider
                min={0}
                max={100}
                step={5}
                value={[essentialWeight]}
                onValueChange={(val) => setEssentialWeight(val[0])}
              />
              <span className="text-[11px] text-muted-foreground block leading-relaxed">
                The official standard allocates <strong>70% weight to APPI Essentials</strong> (Food + Rent survival) and <strong>30% weight to APPI Luxury</strong> (Private vehicle + Healthcare diagnostic security).
              </span>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN (5 Cols): Live Scorecard, Ranking Simulator & Comparative Analytics */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          {/* Main Hero Scorecard */}
          <Card className="border-2 border-primary/40 bg-card/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{countryFlag}</span>
                <div>
                  <h2 className="text-lg font-extrabold text-foreground">{countryName}</h2>
                  <span className="text-xs text-muted-foreground">Atlas Purchasing Power Simulation</span>
                </div>
              </div>

              <Badge
                variant="outline"
                className={`text-xs font-bold px-2.5 py-1 ${
                  stressTier === "Low"
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40"
                    : stressTier === "Moderate"
                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40"
                    : stressTier === "High"
                    ? "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/40"
                    : "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40"
                }`}
              >
                Tier: {stressTier} Stress
              </Badge>
            </div>

            {/* Giant Score Badge */}
            <div className="rounded-2xl bg-primary/10 border border-primary/30 p-5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Simulated APPI Composite
                </span>
                <span className="text-4xl sm:text-5xl font-black text-primary font-heading">
                  {customAppiScore}
                  <span className="text-sm font-normal text-muted-foreground"> / 100</span>
                </span>
              </div>

              <div className="text-right space-y-1">
                <div className="text-xs">
                  <span className="text-muted-foreground">Essentials (Food+Rent): </span>
                  <span className="font-bold text-chart-2">{appiEssentials}</span>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Luxury (Car+Health): </span>
                  <span className="font-bold text-chart-4">{appiLuxury}</span>
                </div>
              </div>
            </div>

            {/* Global Ranking Placement Box */}
            <div className="rounded-xl bg-background/80 border border-border/80 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Trophy className="size-4 text-amber-500" />
                  <span>Simulated Global League Rank</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-primary text-primary-foreground font-black text-xs">
                  #{simulatedRank} of 196
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Based on your inputs, <strong>{countryName}</strong> would rank <strong>#{simulatedRank}</strong> in the world for purchasing power (compared to 195 sovereign nations + the 🌐 World Average baseline).
              </p>
            </div>

            {/* Labor Effort & Household Budget Summary */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Monthly Labor Time & Budget Breakdown
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-lg bg-background/60 border border-border/40 space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block font-medium">🍚 Food Basket Effort</span>
                  <span className="font-bold text-chart-1">{foodLaborHours.toFixed(1)} hrs</span>
                  <span className="text-[10px] text-muted-foreground block">({foodWagePercent.toFixed(1)}% of wage)</span>
                </div>

                <div className="p-3 rounded-lg bg-background/60 border border-border/40 space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block font-medium">🏠 1-BR Rent Effort</span>
                  <span className="font-bold text-chart-2">{rentLaborHours.toFixed(1)} hrs</span>
                  <span className="text-[10px] text-muted-foreground block">({rentWagePercent.toFixed(1)}% of wage)</span>
                </div>

                <div className="p-3 rounded-lg bg-background/60 border border-border/40 space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block font-medium">🚗 Car Purchase Effort</span>
                  <span className="font-bold text-chart-4">{carLaborMonths.toFixed(1)} months</span>
                  <span className="text-[10px] text-muted-foreground block">({carLaborHours.toFixed(0)} labor hrs)</span>
                </div>

                <div className="p-3 rounded-lg bg-background/60 border border-border/40 space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block font-medium">🩺 Medical Checkup Effort</span>
                  <span className="font-bold text-rose-500">{medicalLaborHours.toFixed(1)} hrs</span>
                  <span className="text-[10px] text-muted-foreground block">({medicalWagePercent.toFixed(1)}% of wage)</span>
                </div>
              </div>

              {/* Total Essentials Summary Banner */}
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">🍚🏠 Total Essential Living (Food + Rent):</span>
                  <span className="font-extrabold text-primary">${totalEssentialCost.toFixed(2)}/mo</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                  <span>Wage Share: <strong>{totalEssentialPercent.toFixed(1)}%</strong></span>
                  <span>Work Required: <strong>{totalEssentialLaborHours.toFixed(1)} hrs / month</strong></span>
                </div>
                <div className="flex justify-between items-center text-[11px] pt-1 border-t border-border/30 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Discretionary Surplus Left:</span>
                  <span>${disposableWage.toFixed(2)} ({disposablePercent.toFixed(1)}% • {freeLaborHours.toFixed(1)}h free)</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Benchmark Head-to-Head Comparison Chart */}
          <Card className="border-border/80 bg-card/60 backdrop-blur p-5 rounded-2xl space-y-4 relative z-20 overflow-visible">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                  <BarChart className="size-3.5 text-primary" />
                  <span>Head-to-Head Benchmark Chart</span>
                </h3>
                <span className="text-[11px] text-muted-foreground">Compare custom nation with real economies</span>
              </div>

              <div className="w-full sm:w-48">
                <SearchableSelect
                  options={countrySelectOptions}
                  value={benchmarkCountryId}
                  onChange={setBenchmarkCountryId}
                  placeholder="Select benchmark..."
                  searchPlaceholder="Search country..."
                  size="sm"
                  ariaLabel="Select Benchmark Country"
                />
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                  <Bar dataKey={countryName} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={benchmarkCountry.name} fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="World Avg" fill="hsl(var(--muted-foreground))" opacity={0.4} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
