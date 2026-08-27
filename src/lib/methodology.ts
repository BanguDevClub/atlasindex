import { BASKET_ITEMS } from "../data/basketDefinition";
import type {
  CountryRawData,
  ProcessedCountryEconomy,
  ProcessedItemBurden,
  StressTier,
  Continent,
  ContinentEconomySummary,
  GlobalEconomySummary,
} from "./types";

export function getStressTier(basketPercentOfWage: number): StressTier {
  if (basketPercentOfWage < 10) return "Low";
  if (basketPercentOfWage <= 20) return "Moderate";
  if (basketPercentOfWage <= 35) return "High";
  return "Severe";
}

/**
 * Calculates the Atlas Purchasing Power Index (APPI) on a 0-100 scale.
 * A higher score denotes stronger purchasing power and lower labor effort for nutrition.
 */
export function calculateAPPI(basketPercentOfWage: number, laborHours: number): number {
  const wageBurdenFactor = Math.max(0, 100 - (basketPercentOfWage * 1.8));
  const hoursFactor = Math.max(0, 100 - (laborHours * 1.0));
  
  const score = Math.round((wageBurdenFactor * 0.7) + (hoursFactor * 0.3));
  return Math.min(100, Math.max(1, score));
}

export function processCountryEconomy(raw: CountryRawData): ProcessedCountryEconomy {
  const workHours = raw.workHoursPerMonth || 160;
  const hourlyMedianWageLocal = raw.monthlyMedianWageLocal / workHours;
  const hourlyMedianWageUSD = raw.monthlyMedianWageUSD / workHours;

  let monthlyBasketCostLocal = 0;
  const categoryTotalsUSD = {
    staples: 0,
    meat: 0,
    dairy: 0,
    produce: 0,
    oil: 0,
  };
  const categoryLaborHours = {
    staples: 0,
    meat: 0,
    dairy: 0,
    produce: 0,
    oil: 0,
  };

  const items: ProcessedItemBurden[] = BASKET_ITEMS.map((itemDef) => {
    const unitPriceLocal = raw.foodPricesLocal[itemDef.id] ?? 0;
    const unitPriceUSD = unitPriceLocal / raw.exchangeRateToUSD;
    const monthlyTotalLocal = unitPriceLocal * itemDef.quantityInMonthlyBasket;
    const monthlyTotalUSD = unitPriceUSD * itemDef.quantityInMonthlyBasket;

    monthlyBasketCostLocal += monthlyTotalLocal;

    // Labor effort calculations
    const hoursOfWorkPerUnit = hourlyMedianWageLocal > 0 ? unitPriceLocal / hourlyMedianWageLocal : 0;
    const minutesOfWorkPerUnit = hoursOfWorkPerUnit * 60;
    const percentOfMedianWage = raw.monthlyMedianWageLocal > 0 
      ? (monthlyTotalLocal / raw.monthlyMedianWageLocal) * 100 
      : 0;

    const monthlyHoursForItem = hoursOfWorkPerUnit * itemDef.quantityInMonthlyBasket;

    // Category aggregations
    if (itemDef.category === "staple") {
      categoryTotalsUSD.staples += monthlyTotalUSD;
      categoryLaborHours.staples += monthlyHoursForItem;
    } else if (itemDef.category === "meat") {
      categoryTotalsUSD.meat += monthlyTotalUSD;
      categoryLaborHours.meat += monthlyHoursForItem;
    } else if (itemDef.category === "dairy") {
      categoryTotalsUSD.dairy += monthlyTotalUSD;
      categoryLaborHours.dairy += monthlyHoursForItem;
    } else if (itemDef.category === "produce") {
      categoryTotalsUSD.produce += monthlyTotalUSD;
      categoryLaborHours.produce += monthlyHoursForItem;
    } else if (itemDef.category === "oil") {
      categoryTotalsUSD.oil += monthlyTotalUSD;
      categoryLaborHours.oil += monthlyHoursForItem;
    }

    return {
      itemId: itemDef.id,
      name: itemDef.name,
      category: itemDef.category,
      unit: itemDef.unit,
      quantityInBasket: itemDef.quantityInMonthlyBasket,
      unitPriceLocal,
      unitPriceUSD,
      monthlyTotalLocal,
      monthlyTotalUSD,
      minutesOfWorkPerUnit,
      hoursOfWorkPerUnit,
      percentOfMedianWage,
    };
  });

  const monthlyBasketCostUSD = monthlyBasketCostLocal / raw.exchangeRateToUSD;
  const basketPercentOfWage = raw.monthlyMedianWageLocal > 0 
    ? (monthlyBasketCostLocal / raw.monthlyMedianWageLocal) * 100 
    : 0;
  
  const laborHoursForBasket = hourlyMedianWageLocal > 0 
    ? monthlyBasketCostLocal / hourlyMedianWageLocal 
    : 0;

  // 2. Housing (1-BR Rent)
  const rentMonthlyLocal = raw.rentMonthlyLocal ?? 0;
  const rentMonthlyUSD = rentMonthlyLocal / raw.exchangeRateToUSD;
  const rentPercentOfWage = raw.monthlyMedianWageLocal > 0
    ? (rentMonthlyLocal / raw.monthlyMedianWageLocal) * 100
    : 0;
  const rentLaborHours = hourlyMedianWageLocal > 0
    ? rentMonthlyLocal / hourlyMedianWageLocal
    : 0;

  // 3. Transport (New Passenger Car)
  const carPriceLocal = raw.carPriceLocal ?? 0;
  const carPriceUSD = carPriceLocal / raw.exchangeRateToUSD;
  const carLaborMonths = raw.monthlyMedianWageLocal > 0
    ? carPriceLocal / raw.monthlyMedianWageLocal
    : 0;
  const carLaborHours = carLaborMonths * workHours;

  // 4. Healthcare (Routine Medical Checkup & Lab Exam)
  const medicalCheckupLocal = raw.medicalCheckupLocal ?? 0;
  const medicalCheckupUSD = medicalCheckupLocal / raw.exchangeRateToUSD;
  const medicalCheckupPercentOfWage = raw.monthlyMedianWageLocal > 0
    ? (medicalCheckupLocal / raw.monthlyMedianWageLocal) * 100
    : 0;
  const medicalCheckupLaborHours = hourlyMedianWageLocal > 0
    ? medicalCheckupLocal / hourlyMedianWageLocal
    : 0;

  // Combined Essential Living (Food Basket + Rent)
  const totalEssentialMonthlyCostUSD = monthlyBasketCostUSD + rentMonthlyUSD;
  const totalEssentialPercentOfWage = raw.monthlyMedianWageUSD > 0
    ? (totalEssentialMonthlyCostUSD / raw.monthlyMedianWageUSD) * 100
    : 0;
  const totalEssentialLaborHours = laborHoursForBasket + rentLaborHours;

  const appiScore = calculateAPPI(basketPercentOfWage, laborHoursForBasket);
  const stressTier = getStressTier(basketPercentOfWage);

  const remainingDisposableWageLocal = Math.max(0, raw.monthlyMedianWageLocal - monthlyBasketCostLocal);
  const remainingDisposableWageUSD = Math.max(0, raw.monthlyMedianWageUSD - monthlyBasketCostUSD);
  const remainingLaborHours = Math.max(0, workHours - laborHoursForBasket);
  const remainingWagePercent = Math.max(0, 100 - basketPercentOfWage);

  return {
    id: raw.id,
    name: raw.name,
    code: raw.code,
    flag: raw.flag,
    continent: raw.continent,
    currencyCode: raw.currencyCode,
    currencySymbol: raw.currencySymbol,
    exchangeRateToUSD: raw.exchangeRateToUSD,
    monthlyMedianWageLocal: raw.monthlyMedianWageLocal,
    monthlyMedianWageUSD: raw.monthlyMedianWageUSD,
    hourlyMedianWageLocal,
    hourlyMedianWageUSD,
    monthlyBasketCostLocal,
    monthlyBasketCostUSD,
    basketPercentOfWage,
    laborHoursForBasket,
    rentMonthlyLocal,
    rentMonthlyUSD,
    rentPercentOfWage,
    rentLaborHours,
    carPriceLocal,
    carPriceUSD,
    carLaborMonths,
    carLaborHours,
    medicalCheckupLocal,
    medicalCheckupUSD,
    medicalCheckupPercentOfWage,
    medicalCheckupLaborHours,
    totalEssentialMonthlyCostUSD,
    totalEssentialPercentOfWage,
    totalEssentialLaborHours,
    remainingDisposableWageLocal,
    remainingDisposableWageUSD,
    remainingLaborHours,
    remainingWagePercent,
    categoryTotalsUSD,
    categoryLaborHours,
    items,
    appiScore,
    stressTier,
    dataYear: raw.dataYear,
    wageSource: raw.wageSource,
    wageSourceUrl: raw.wageSourceUrl,
    priceSource: raw.priceSource,
    priceSourceUrl: raw.priceSourceUrl,
    notes: raw.notes,
    isEstimated: raw.isEstimated,
    estimationDisclaimer: raw.estimationDisclaimer,
  };
}

export function getAllProcessedCountries(rawCountries: CountryRawData[]): ProcessedCountryEconomy[] {
  const processed = rawCountries.map(processCountryEconomy);

  // 1. Food Rank (Primary default rank)
  processed.sort((a, b) => a.basketPercentOfWage - b.basketPercentOfWage);
  processed.forEach((c, idx) => {
    c.rank = idx + 1;
  });

  // 2. Rent Rank
  const byRent = [...processed].sort((a, b) => a.rentPercentOfWage - b.rentPercentOfWage);
  byRent.forEach((c, idx) => {
    const found = processed.find((p) => p.id === c.id);
    if (found) found.rentRank = idx + 1;
  });

  // 3. Car Rank
  const byCar = [...processed].sort((a, b) => a.carLaborMonths - b.carLaborMonths);
  byCar.forEach((c, idx) => {
    const found = processed.find((p) => p.id === c.id);
    if (found) found.carRank = idx + 1;
  });

  // 4. Medical Rank
  const byMedical = [...processed].sort((a, b) => a.medicalCheckupPercentOfWage - b.medicalCheckupPercentOfWage);
  byMedical.forEach((c, idx) => {
    const found = processed.find((p) => p.id === c.id);
    if (found) found.medicalRank = idx + 1;
  });

  // 5. Combined Essential Rank
  const byCombined = [...processed].sort((a, b) => a.totalEssentialPercentOfWage - b.totalEssentialPercentOfWage);
  byCombined.forEach((c, idx) => {
    const found = processed.find((p) => p.id === c.id);
    if (found) found.combinedRank = idx + 1;
  });

  return processed;
}

export function calculateCustomWageEffort(
  country: ProcessedCountryEconomy,
  customMonthlyWageUSD: number
) {
  if (customMonthlyWageUSD <= 0) return {
    basketPercent: 0,
    laborHours: 0,
    rentPercent: 0,
    rentHours: 0,
    carMonths: 0,
    medicalPercent: 0,
    medicalHours: 0,
    totalEssentialPercent: 0,
    totalEssentialHours: 0,
    stressTier: "Low" as StressTier,
  };

  const customHourlyWageUSD = customMonthlyWageUSD / 160;
  const basketPercent = (country.monthlyBasketCostUSD / customMonthlyWageUSD) * 100;
  const laborHours = country.monthlyBasketCostUSD / customHourlyWageUSD;
  const rentPercent = (country.rentMonthlyUSD / customMonthlyWageUSD) * 100;
  const rentHours = country.rentMonthlyUSD / customHourlyWageUSD;
  const carMonths = country.carPriceUSD / customMonthlyWageUSD;
  const medicalPercent = (country.medicalCheckupUSD / customMonthlyWageUSD) * 100;
  const medicalHours = country.medicalCheckupUSD / customHourlyWageUSD;
  const totalEssentialPercent = basketPercent + rentPercent;
  const totalEssentialHours = laborHours + rentHours;

  return {
    basketPercent,
    laborHours,
    rentPercent,
    rentHours,
    carMonths,
    medicalPercent,
    medicalHours,
    totalEssentialPercent,
    totalEssentialHours,
    stressTier: getStressTier(basketPercent),
  };
}

export function getGlobalSummary(processedCountries: ProcessedCountryEconomy[]): GlobalEconomySummary {
  const countryCount = processedCountries.length;
  if (countryCount === 0) {
    throw new Error("No countries to summarize");
  }

  const avgMonthlyWageUSD = processedCountries.reduce((acc, c) => acc + c.monthlyMedianWageUSD, 0) / countryCount;
  const avgBasketCostUSD = processedCountries.reduce((acc, c) => acc + c.monthlyBasketCostUSD, 0) / countryCount;
  const avgLaborHoursFood = processedCountries.reduce((acc, c) => acc + c.laborHoursForBasket, 0) / countryCount;
  const avgBasketPercentOfWage = processedCountries.reduce((acc, c) => acc + c.basketPercentOfWage, 0) / countryCount;

  const avgRentUSD = processedCountries.reduce((acc, c) => acc + c.rentMonthlyUSD, 0) / countryCount;
  const avgRentLaborHours = processedCountries.reduce((acc, c) => acc + c.rentLaborHours, 0) / countryCount;
  const avgRentPercentOfWage = processedCountries.reduce((acc, c) => acc + c.rentPercentOfWage, 0) / countryCount;

  const avgCarPriceUSD = processedCountries.reduce((acc, c) => acc + c.carPriceUSD, 0) / countryCount;
  const avgCarLaborMonths = processedCountries.reduce((acc, c) => acc + c.carLaborMonths, 0) / countryCount;

  const avgMedicalCheckupUSD = processedCountries.reduce((acc, c) => acc + c.medicalCheckupUSD, 0) / countryCount;
  const avgMedicalCheckupLaborHours = processedCountries.reduce((acc, c) => acc + c.medicalCheckupLaborHours, 0) / countryCount;
  const avgMedicalCheckupPercentOfWage = processedCountries.reduce((acc, c) => acc + c.medicalCheckupPercentOfWage, 0) / countryCount;

  const avgTotalEssentialCostUSD = processedCountries.reduce((acc, c) => acc + c.totalEssentialMonthlyCostUSD, 0) / countryCount;
  const avgTotalEssentialLaborHours = processedCountries.reduce((acc, c) => acc + c.totalEssentialLaborHours, 0) / countryCount;
  const avgTotalEssentialPercentOfWage = processedCountries.reduce((acc, c) => acc + c.totalEssentialPercentOfWage, 0) / countryCount;

  const avgAppiScore = Math.round(processedCountries.reduce((acc, c) => acc + c.appiScore, 0) / countryCount);

  const tierDistribution = {
    Low: processedCountries.filter((c) => c.stressTier === "Low").length,
    Moderate: processedCountries.filter((c) => c.stressTier === "Moderate").length,
    High: processedCountries.filter((c) => c.stressTier === "High").length,
    Severe: processedCountries.filter((c) => c.stressTier === "Severe").length,
  };

  const byFood = [...processedCountries].sort((a, b) => a.basketPercentOfWage - b.basketPercentOfWage);
  const byRent = [...processedCountries].sort((a, b) => a.rentPercentOfWage - b.rentPercentOfWage);
  const byCar = [...processedCountries].sort((a, b) => a.carLaborMonths - b.carLaborMonths);
  const byMedical = [...processedCountries].sort((a, b) => a.medicalCheckupPercentOfWage - b.medicalCheckupPercentOfWage);

  return {
    countryCount,
    avgMonthlyWageUSD,
    avgBasketCostUSD,
    avgLaborHoursFood,
    avgBasketPercentOfWage,
    avgRentUSD,
    avgRentLaborHours,
    avgRentPercentOfWage,
    avgCarPriceUSD,
    avgCarLaborMonths,
    avgMedicalCheckupUSD,
    avgMedicalCheckupLaborHours,
    avgMedicalCheckupPercentOfWage,
    avgTotalEssentialCostUSD,
    avgTotalEssentialLaborHours,
    avgTotalEssentialPercentOfWage,
    avgAppiScore,
    tierDistribution,
    bestFoodCountry: byFood[0],
    worstFoodCountry: byFood[byFood.length - 1],
    bestRentCountry: byRent[0],
    worstRentCountry: byRent[byRent.length - 1],
    bestCarCountry: byCar[0],
    worstCarCountry: byCar[byCar.length - 1],
    bestMedicalCountry: byMedical[0],
    worstMedicalCountry: byMedical[byMedical.length - 1],
  };
}

export function getWorldAverageCountry(processedCountries: ProcessedCountryEconomy[]): ProcessedCountryEconomy {
  const summary = getGlobalSummary(processedCountries);
  const count = processedCountries.length;

  const categoryTotalsUSD = {
    staples: processedCountries.reduce((acc, c) => acc + c.categoryTotalsUSD.staples, 0) / count,
    meat: processedCountries.reduce((acc, c) => acc + c.categoryTotalsUSD.meat, 0) / count,
    dairy: processedCountries.reduce((acc, c) => acc + c.categoryTotalsUSD.dairy, 0) / count,
    produce: processedCountries.reduce((acc, c) => acc + c.categoryTotalsUSD.produce, 0) / count,
    oil: processedCountries.reduce((acc, c) => acc + c.categoryTotalsUSD.oil, 0) / count,
  };

  const categoryLaborHours = {
    staples: processedCountries.reduce((acc, c) => acc + c.categoryLaborHours.staples, 0) / count,
    meat: processedCountries.reduce((acc, c) => acc + c.categoryLaborHours.meat, 0) / count,
    dairy: processedCountries.reduce((acc, c) => acc + c.categoryLaborHours.dairy, 0) / count,
    produce: processedCountries.reduce((acc, c) => acc + c.categoryLaborHours.produce, 0) / count,
    oil: processedCountries.reduce((acc, c) => acc + c.categoryLaborHours.oil, 0) / count,
  };

  const first = processedCountries[0];
  const items: ProcessedItemBurden[] = first.items.map((itemDef) => {
    const avgPriceUSD = processedCountries.reduce((acc, c) => {
      const it = c.items.find((i) => i.itemId === itemDef.itemId);
      return acc + (it ? it.unitPriceUSD : 0);
    }, 0) / count;

    const hourlyWage = summary.avgMonthlyWageUSD / 160;
    const hoursOfWorkPerUnit = hourlyWage > 0 ? avgPriceUSD / hourlyWage : 0;
    const minutesOfWorkPerUnit = hoursOfWorkPerUnit * 60;
    const monthlyTotalUSD = avgPriceUSD * itemDef.quantityInBasket;
    const percentOfMedianWage = summary.avgMonthlyWageUSD > 0 ? (monthlyTotalUSD / summary.avgMonthlyWageUSD) * 100 : 0;

    return {
      itemId: itemDef.itemId,
      name: itemDef.name,
      category: itemDef.category,
      unit: itemDef.unit,
      quantityInBasket: itemDef.quantityInBasket,
      unitPriceLocal: avgPriceUSD,
      unitPriceUSD: avgPriceUSD,
      monthlyTotalLocal: monthlyTotalUSD,
      monthlyTotalUSD: monthlyTotalUSD,
      minutesOfWorkPerUnit,
      hoursOfWorkPerUnit,
      percentOfMedianWage,
    };
  });

  return {
    id: "world-average",
    name: "World Average",
    code: "GLOBAL",
    flag: "🌐",
    continent: "Europe",
    currencyCode: "USD",
    currencySymbol: "$",
    exchangeRateToUSD: 1.0,
    monthlyMedianWageLocal: summary.avgMonthlyWageUSD,
    monthlyMedianWageUSD: summary.avgMonthlyWageUSD,
    hourlyMedianWageLocal: summary.avgMonthlyWageUSD / 160,
    hourlyMedianWageUSD: summary.avgMonthlyWageUSD / 160,
    monthlyBasketCostLocal: summary.avgBasketCostUSD,
    monthlyBasketCostUSD: summary.avgBasketCostUSD,
    basketPercentOfWage: summary.avgBasketPercentOfWage,
    laborHoursForBasket: summary.avgLaborHoursFood,
    rentMonthlyLocal: summary.avgRentUSD,
    rentMonthlyUSD: summary.avgRentUSD,
    rentPercentOfWage: summary.avgRentPercentOfWage,
    rentLaborHours: summary.avgRentLaborHours,
    carPriceLocal: summary.avgCarPriceUSD,
    carPriceUSD: summary.avgCarPriceUSD,
    carLaborMonths: summary.avgCarLaborMonths,
    carLaborHours: summary.avgCarLaborMonths * 160,
    medicalCheckupLocal: summary.avgMedicalCheckupUSD,
    medicalCheckupUSD: summary.avgMedicalCheckupUSD,
    medicalCheckupPercentOfWage: summary.avgMedicalCheckupPercentOfWage,
    medicalCheckupLaborHours: summary.avgMedicalCheckupLaborHours,
    totalEssentialMonthlyCostUSD: summary.avgTotalEssentialCostUSD,
    totalEssentialPercentOfWage: summary.avgTotalEssentialPercentOfWage,
    totalEssentialLaborHours: summary.avgTotalEssentialLaborHours,
    remainingDisposableWageLocal: Math.max(0, summary.avgMonthlyWageUSD - summary.avgBasketCostUSD),
    remainingDisposableWageUSD: Math.max(0, summary.avgMonthlyWageUSD - summary.avgBasketCostUSD),
    remainingLaborHours: Math.max(0, 160 - summary.avgLaborHoursFood),
    remainingWagePercent: Math.max(0, 100 - summary.avgBasketPercentOfWage),
    categoryTotalsUSD,
    categoryLaborHours,
    items,
    appiScore: summary.avgAppiScore,
    stressTier: getStressTier(summary.avgBasketPercentOfWage),
    rank: 0,
    dataYear: 2025,
    wageSource: "Global 195 Sovereign Nations Synthesis",
    wageSourceUrl: "https://bangudevclub.github.io/atlasindex/methodology",
    priceSource: "Global Institutional Dataset Aggregate",
    priceSourceUrl: "https://bangudevclub.github.io/atlasindex/methodology",
    notes: "Arithmetic mean across all 195 sovereign countries of the world.",
  };
}

export function getContinentalSummaries(processedCountries: ProcessedCountryEconomy[]): ContinentEconomySummary[] {
  const continents: Continent[] = ["Europe", "Americas", "Asia", "Oceania", "Africa"];

  return continents.map((continent) => {
    const countries = processedCountries.filter((c) => c.continent === continent);
    if (countries.length === 0) {
      throw new Error(`No countries found for continent: ${continent}`);
    }

    const countryCount = countries.length;
    const avgMonthlyWageUSD = countries.reduce((acc, c) => acc + c.monthlyMedianWageUSD, 0) / countryCount;
    const avgBasketCostUSD = countries.reduce((acc, c) => acc + c.monthlyBasketCostUSD, 0) / countryCount;
    const avgLaborHours = countries.reduce((acc, c) => acc + c.laborHoursForBasket, 0) / countryCount;
    const avgBasketPercentOfWage = countries.reduce((acc, c) => acc + c.basketPercentOfWage, 0) / countryCount;

    const avgRentUSD = countries.reduce((acc, c) => acc + c.rentMonthlyUSD, 0) / countryCount;
    const avgRentLaborHours = countries.reduce((acc, c) => acc + c.rentLaborHours, 0) / countryCount;
    const avgRentPercentOfWage = countries.reduce((acc, c) => acc + c.rentPercentOfWage, 0) / countryCount;

    const avgCarPriceUSD = countries.reduce((acc, c) => acc + c.carPriceUSD, 0) / countryCount;
    const avgCarLaborMonths = countries.reduce((acc, c) => acc + c.carLaborMonths, 0) / countryCount;

    const avgMedicalCheckupUSD = countries.reduce((acc, c) => acc + c.medicalCheckupUSD, 0) / countryCount;
    const avgMedicalCheckupLaborHours = countries.reduce((acc, c) => acc + c.medicalCheckupLaborHours, 0) / countryCount;
    const avgMedicalCheckupPercentOfWage = countries.reduce((acc, c) => acc + c.medicalCheckupPercentOfWage, 0) / countryCount;

    const avgAppiScore = Math.round(countries.reduce((acc, c) => acc + c.appiScore, 0) / countryCount);

    const categoryLaborHours = {
      staples: countries.reduce((acc, c) => acc + c.categoryLaborHours.staples, 0) / countryCount,
      meat: countries.reduce((acc, c) => acc + c.categoryLaborHours.meat, 0) / countryCount,
      dairy: countries.reduce((acc, c) => acc + c.categoryLaborHours.dairy, 0) / countryCount,
      produce: countries.reduce((acc, c) => acc + c.categoryLaborHours.produce, 0) / countryCount,
      oil: countries.reduce((acc, c) => acc + c.categoryLaborHours.oil, 0) / countryCount,
    };

    const tierDistribution = {
      Low: countries.filter((c) => c.stressTier === "Low").length,
      Moderate: countries.filter((c) => c.stressTier === "Moderate").length,
      High: countries.filter((c) => c.stressTier === "High").length,
      Severe: countries.filter((c) => c.stressTier === "Severe").length,
    };

    // Countries are already sorted by rank / basket percent
    const bestCountry = countries[0];
    const worstCountry = countries[countries.length - 1];

    return {
      continent,
      countryCount,
      avgMonthlyWageUSD,
      avgBasketCostUSD,
      avgLaborHours,
      avgBasketPercentOfWage,
      avgRentUSD,
      avgRentLaborHours,
      avgRentPercentOfWage,
      avgCarPriceUSD,
      avgCarLaborMonths,
      avgMedicalCheckupUSD,
      avgMedicalCheckupLaborHours,
      avgMedicalCheckupPercentOfWage,
      avgAppiScore,
      categoryLaborHours,
      tierDistribution,
      bestCountry,
      worstCountry,
      countries,
    };
  }).sort((a, b) => a.avgLaborHours - b.avgLaborHours);
}
