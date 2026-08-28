import { BASKET_ITEMS } from "../data/basketDefinition";
import type {
  CountryRawData,
  ProcessedCountryEconomy,
  ProcessedItemBurden,
  StressTier,
  Continent,
  ContinentEconomySummary,
  GlobalEconomySummary,
  CustomWageResult,
} from "./types";

/**
 * Categorizes an APPI score into 4 standard Purchasing Power & Living Stress Tiers.
 * Tier 1: Low Stress (APPI >= 70)
 * Tier 2: Moderate Stress (50 <= APPI < 70)
 * Tier 3: High Stress (25 <= APPI < 50)
 * Tier 4: Severe Stress (APPI < 25)
 */
export function getStressTier(score: number): StressTier {
  if (score >= 70) return "Low";
  if (score >= 50) return "Moderate";
  if (score >= 25) return "High";
  return "Severe";
}

/**
 * Calculates APPI Essentials (Food + 1-BR Housing Rent) on a 1-100 scale.
 * Weighted 70% on wage share burden (Engel's Law) and 30% on absolute labor hours.
 */
export function calculateAPPIEssentials(essentialPercentOfWage: number, essentialLaborHours: number): number {
  if (essentialPercentOfWage <= 0 || essentialLaborHours <= 0) return 1;
  const wageBurdenFactor = Math.max(0, 100 - (essentialPercentOfWage * 0.90));
  const hoursFactor = Math.max(0, 100 - (essentialLaborHours * 0.55));
  
  const score = Math.round((wageBurdenFactor * 0.70) + (hoursFactor * 0.30));
  return Math.min(100, Math.max(1, score));
}

/**
 * Calculates APPI Luxury (Transport Car Purchase + Healthcare Medical Exam) on a 1-100 scale.
 * Combines labor months for passenger vehicle purchase and labor cost for clinical blood panels.
 */
export function calculateAPPILuxury(carLaborMonths: number, medicalPercentOfWage: number): number {
  if (carLaborMonths <= 0 && medicalPercentOfWage <= 0) return 1;
  const carFactor = Math.max(0, 100 - (carLaborMonths * 1.25));
  const medicalFactor = Math.max(0, 100 - (medicalPercentOfWage * 2.5));
  
  const score = Math.round((carFactor * 0.60) + (medicalFactor * 0.40));
  return Math.min(100, Math.max(1, score));
}

/**
 * Calculates the Composite Atlas Purchasing Power Index (APPI) on a 1-100 scale:
 * 70% APPI Essentials (Food + Rent) + 30% APPI Luxury (Health + Car).
 */
export function calculateAPPI(
  essentialPercentOrScore: number,
  essentialLaborHoursOrLuxuryScore?: number,
  isDirectComponents: boolean = false
): number {
  if (isDirectComponents || (essentialLaborHoursOrLuxuryScore !== undefined && essentialLaborHoursOrLuxuryScore <= 100 && essentialPercentOrScore <= 100 && essentialLaborHoursOrLuxuryScore >= 0)) {
    const ess = essentialPercentOrScore;
    const lux = essentialLaborHoursOrLuxuryScore ?? 1;
    const score = Math.round((ess * 0.70) + (lux * 0.30));
    return Math.min(100, Math.max(1, score));
  }

  // Fallback for legacy calls (percent, hours)
  const essScore = calculateAPPIEssentials(essentialPercentOrScore, essentialLaborHoursOrLuxuryScore ?? 0);
  return essScore;
}

export function calculateAPPIComposite(appiEssentials: number, appiLuxury: number): number {
  const score = Math.round((appiEssentials * 0.70) + (appiLuxury * 0.30));
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

  // 1. Food Basket
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
  const totalEssentialPercentOfWage = basketPercentOfWage + rentPercentOfWage;
  const totalEssentialLaborHours = laborHoursForBasket + rentLaborHours;

  // Compute APPI Essentials (Food + Rent)
  const appiEssentials = calculateAPPIEssentials(totalEssentialPercentOfWage, totalEssentialLaborHours);

  // Compute APPI Luxury (Health + Car)
  const appiLuxury = calculateAPPILuxury(carLaborMonths, medicalCheckupPercentOfWage);

  // Compute Composite APPI (70% Essentials + 30% Luxury)
  const appiScore = calculateAPPIComposite(appiEssentials, appiLuxury);
  const stressTier = getStressTier(appiScore);

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
    appiEssentials,
    appiLuxury,
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

  // 1. Primary Composite APPI Rank (Highest APPI score = Rank 1)
  processed.sort((a, b) => b.appiScore - a.appiScore || a.totalEssentialPercentOfWage - b.totalEssentialPercentOfWage);
  processed.forEach((c, idx) => {
    c.rank = idx + 1;
  });

  // 2. APPI Essentials Rank
  const byEssentials = [...processed].sort((a, b) => b.appiEssentials - a.appiEssentials || a.totalEssentialPercentOfWage - b.totalEssentialPercentOfWage);
  byEssentials.forEach((c, idx) => {
    const found = processed.find((p) => p.id === c.id);
    if (found) found.essentialsRank = idx + 1;
  });

  // 3. APPI Luxury Rank
  const byLuxury = [...processed].sort((a, b) => b.appiLuxury - a.appiLuxury || a.carLaborMonths - b.carLaborMonths);
  byLuxury.forEach((c, idx) => {
    const found = processed.find((p) => p.id === c.id);
    if (found) found.luxuryRank = idx + 1;
  });

  // 4. Rent Rank
  const byRent = [...processed].sort((a, b) => a.rentPercentOfWage - b.rentPercentOfWage);
  byRent.forEach((c, idx) => {
    const found = processed.find((p) => p.id === c.id);
    if (found) found.rentRank = idx + 1;
  });

  // 5. Car Rank
  const byCar = [...processed].sort((a, b) => a.carLaborMonths - b.carLaborMonths);
  byCar.forEach((c, idx) => {
    const found = processed.find((p) => p.id === c.id);
    if (found) found.carRank = idx + 1;
  });

  // 6. Medical Rank
  const byMedical = [...processed].sort((a, b) => a.medicalCheckupPercentOfWage - b.medicalCheckupPercentOfWage);
  byMedical.forEach((c, idx) => {
    const found = processed.find((p) => p.id === c.id);
    if (found) found.medicalRank = idx + 1;
  });

  // 7. Combined Essential Living Rank
  const byEssentialCost = [...processed].sort((a, b) => a.totalEssentialPercentOfWage - b.totalEssentialPercentOfWage);
  byEssentialCost.forEach((c, idx) => {
    const found = processed.find((p) => p.id === c.id);
    if (found) found.combinedRank = idx + 1;
  });

  return processed;
}

export function calculateCustomWageEffort(
  country: ProcessedCountryEconomy,
  customMonthlyWageUSD: number
): CustomWageResult {
  if (customMonthlyWageUSD <= 0) {
    return {
      basketPercent: 0,
      laborHours: 0,
      rentPercent: 0,
      rentHours: 0,
      carMonths: 0,
      medicalPercent: 0,
      medicalHours: 0,
      totalEssentialPercent: 0,
      totalEssentialHours: 0,
      appiScore: 0,
      appiEssentials: 0,
      appiLuxury: 0,
      stressTier: "Severe" as StressTier,
    };
  }

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

  const appiEssentials = calculateAPPIEssentials(totalEssentialPercent, totalEssentialHours);
  const appiLuxury = calculateAPPILuxury(carMonths, medicalPercent);
  const appiScore = calculateAPPIComposite(appiEssentials, appiLuxury);
  const stressTier = getStressTier(appiScore);

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
    appiScore,
    appiEssentials,
    appiLuxury,
    stressTier,
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

  const avgAppiEssentials = Math.round(processedCountries.reduce((acc, c) => acc + c.appiEssentials, 0) / countryCount);
  const avgAppiLuxury = Math.round(processedCountries.reduce((acc, c) => acc + c.appiLuxury, 0) / countryCount);
  const avgAppiScore = calculateAPPIComposite(avgAppiEssentials, avgAppiLuxury);

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
    avgAppiEssentials,
    avgAppiLuxury,
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
    appiEssentials: summary.avgAppiEssentials,
    appiLuxury: summary.avgAppiLuxury,
    stressTier: getStressTier(summary.avgAppiScore),
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

    const avgAppiEssentials = Math.round(countries.reduce((acc, c) => acc + c.appiEssentials, 0) / countryCount);
    const avgAppiLuxury = Math.round(countries.reduce((acc, c) => acc + c.appiLuxury, 0) / countryCount);
    const avgAppiScore = calculateAPPIComposite(avgAppiEssentials, avgAppiLuxury);

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

    // Sorted by APPI Composite score
    const sorted = [...countries].sort((a, b) => b.appiScore - a.appiScore);
    const bestCountry = sorted[0];
    const worstCountry = sorted[sorted.length - 1];

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
      avgAppiEssentials,
      avgAppiLuxury,
      categoryLaborHours,
      tierDistribution,
      bestCountry,
      worstCountry,
      countries,
    };
  }).sort((a, b) => b.avgAppiScore - a.avgAppiScore);
}
