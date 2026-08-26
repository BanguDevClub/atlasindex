import { BASKET_ITEMS } from "../data/basketDefinition";
import type { CountryRawData, ProcessedCountryEconomy, ProcessedItemBurden, StressTier } from "./types";

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
  // Score based on percentage of wage (70% weight) and absolute labor hours (30% weight)
  // Ideal benchmark: 4% of wage and 6.4 labor hours -> Score ~100
  // Severe stress benchmark: 50% of wage and 80 labor hours -> Score ~10
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
  };
}

export function getAllProcessedCountries(rawCountries: CountryRawData[]): ProcessedCountryEconomy[] {
  const processed = rawCountries.map(processCountryEconomy);
  // Sort ascending by basketPercentOfWage (lowest burden = Rank 1)
  processed.sort((a, b) => a.basketPercentOfWage - b.basketPercentOfWage);
  return processed.map((c, idx) => ({
    ...c,
    rank: idx + 1,
  }));
}

export function calculateCustomWageEffort(
  country: ProcessedCountryEconomy,
  customMonthlyWageUSD: number
) {
  if (customMonthlyWageUSD <= 0) return { basketPercent: 0, laborHours: 0 };
  const customHourlyWageUSD = customMonthlyWageUSD / 160;
  const basketPercent = (country.monthlyBasketCostUSD / customMonthlyWageUSD) * 100;
  const laborHours = country.monthlyBasketCostUSD / customHourlyWageUSD;
  return {
    basketPercent,
    laborHours,
    stressTier: getStressTier(basketPercent),
  };
}
