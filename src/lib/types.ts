export type Continent = "Africa" | "Americas" | "Asia" | "Europe" | "Oceania";

export type StressTier = "Low" | "Moderate" | "High" | "Severe";

export interface FoodPriceItem {
  id: string;
  name: string;
  category: "staple" | "meat" | "dairy" | "produce" | "oil";
  unit: string; // e.g. "1 kg", "1 L", "12 eggs"
  quantityInMonthlyBasket: number; // reference multiplier
  iconName: string;
}

export interface CountryRawData {
  id: string;
  name: string;
  code: string; // ISO 2-letter
  flag: string; // Emoji flag
  continent: Continent;
  currencyCode: string;
  currencySymbol: string;
  exchangeRateToUSD: number; // 1 USD = X local currency (e.g. 5.10 BRL)
  monthlyMedianWageLocal: number;
  monthlyMedianWageUSD: number;
  workHoursPerMonth: number; // standard 160h
  foodPricesLocal: Record<string, number>; // itemId -> local price per unit
  
  // Non-Food Pillars (Local Currency)
  rentMonthlyLocal?: number; // Standard 1-Bedroom Apartment monthly rent
  carPriceLocal?: number; // Standard new entry-level compact passenger car (e.g. Toyota Corolla / VW Golf equivalent)
  medicalCheckupLocal?: number; // Standard routine comprehensive medical checkup (doctor consultation + CBC + lipid + metabolic panel)

  dataYear: number;
  wageSource: string;
  wageSourceUrl: string;
  priceSource: string;
  priceSourceUrl: string;
  notes?: string;
  isEstimated?: boolean; // true for economies with restricted reporting (e.g. North Korea)
  estimationDisclaimer?: string; // transparent explanation of econometric estimation
}

export interface ProcessedItemBurden {
  itemId: string;
  name: string;
  category: "staple" | "meat" | "dairy" | "produce" | "oil";
  unit: string;
  quantityInBasket: number;
  unitPriceLocal: number;
  unitPriceUSD: number;
  monthlyTotalLocal: number;
  monthlyTotalUSD: number;
  minutesOfWorkPerUnit: number;
  hoursOfWorkPerUnit: number;
  percentOfMedianWage: number;
}

export interface ProcessedCountryEconomy {
  id: string;
  name: string;
  code: string;
  flag: string;
  continent: Continent;
  currencyCode: string;
  currencySymbol: string;
  exchangeRateToUSD: number;
  monthlyMedianWageLocal: number;
  monthlyMedianWageUSD: number;
  hourlyMedianWageLocal: number;
  hourlyMedianWageUSD: number;
  
  // Pillar 1: Total Food Basket Calculations
  monthlyBasketCostLocal: number;
  monthlyBasketCostUSD: number;
  basketPercentOfWage: number;
  laborHoursForBasket: number;

  // Pillar 2: Housing (1-Bedroom Apartment Monthly Rent)
  rentMonthlyLocal: number;
  rentMonthlyUSD: number;
  rentPercentOfWage: number;
  rentLaborHours: number;

  // Pillar 3: Transport (Standard New Car Purchase)
  carPriceLocal: number;
  carPriceUSD: number;
  carLaborMonths: number;
  carLaborHours: number;

  // Pillar 4: Healthcare (Comprehensive Routine Medical Checkup)
  medicalCheckupLocal: number;
  medicalCheckupUSD: number;
  medicalCheckupPercentOfWage: number;
  medicalCheckupLaborHours: number;

  // Combined Essential Living (Food Basket + Rent)
  totalEssentialMonthlyCostUSD: number;
  totalEssentialPercentOfWage: number;
  totalEssentialLaborHours: number;

  // Value & Effort Remaining After Food
  remainingDisposableWageLocal: number;
  remainingDisposableWageUSD: number;
  remainingLaborHours: number;
  remainingWagePercent: number;
  
  // Sub-category totals (USD and Labor Hours)
  categoryTotalsUSD: {
    staples: number;
    meat: number;
    dairy: number;
    produce: number;
    oil: number;
  };
  categoryLaborHours: {
    staples: number;
    meat: number;
    dairy: number;
    produce: number;
    oil: number;
  };

  // Detailed items
  items: ProcessedItemBurden[];

  // Indices & APPI Breakdown
  appiScore: number; // 0-100 Composite APPI: 70% Essentials + 30% Luxury
  appiEssentials: number; // 0-100 APPI Essentials (Food + Rent)
  appiLuxury: number; // 0-100 APPI Luxury (Health + Car)
  stressTier: StressTier;
  
  // Rankings
  rank?: number; // Primary Composite APPI Rank
  essentialsRank?: number; // APPI Essentials Rank
  luxuryRank?: number; // APPI Luxury Rank
  rentRank?: number;
  carRank?: number;
  medicalRank?: number;
  combinedRank?: number;

  dataYear: number;
  wageSource: string;
  wageSourceUrl: string;
  priceSource: string;
  priceSourceUrl: string;
  notes?: string;
  isEstimated?: boolean;
  estimationDisclaimer?: string;
}

export interface CustomWageResult {
  basketPercent: number;
  laborHours: number;
  rentPercent: number;
  rentHours: number;
  carMonths: number;
  medicalPercent: number;
  medicalHours: number;
  totalEssentialPercent: number;
  totalEssentialHours: number;
  appiScore: number;
  appiEssentials: number;
  appiLuxury: number;
  stressTier: StressTier;
}

export interface GlobalEconomySummary {
  countryCount: number; // 195
  avgMonthlyWageUSD: number;
  avgBasketCostUSD: number;
  avgLaborHoursFood: number;
  avgBasketPercentOfWage: number;
  
  avgRentUSD: number;
  avgRentLaborHours: number;
  avgRentPercentOfWage: number;

  avgCarPriceUSD: number;
  avgCarLaborMonths: number;

  avgMedicalCheckupUSD: number;
  avgMedicalCheckupLaborHours: number;
  avgMedicalCheckupPercentOfWage: number;

  avgTotalEssentialCostUSD: number;
  avgTotalEssentialLaborHours: number;
  avgTotalEssentialPercentOfWage: number;

  /** APPI *of* the global mean pillar values (20/26/22), not the mean of individual APPI scores (≈34/52/39). See methodology.ts. */
  avgAppiScore: number;
  avgAppiEssentials: number;
  avgAppiLuxury: number;

  tierDistribution: {
    Low: number;
    Moderate: number;
    High: number;
    Severe: number;
  };

  bestFoodCountry: ProcessedCountryEconomy;
  worstFoodCountry: ProcessedCountryEconomy;
  bestRentCountry: ProcessedCountryEconomy;
  worstRentCountry: ProcessedCountryEconomy;
  bestCarCountry: ProcessedCountryEconomy;
  worstCarCountry: ProcessedCountryEconomy;
  bestMedicalCountry: ProcessedCountryEconomy;
  worstMedicalCountry: ProcessedCountryEconomy;
}

export interface ContinentEconomySummary {
  continent: Continent;
  countryCount: number;
  avgMonthlyWageUSD: number;
  avgBasketCostUSD: number;
  avgLaborHours: number;
  avgBasketPercentOfWage: number;
  
  avgRentUSD: number;
  avgRentLaborHours: number;
  avgRentPercentOfWage: number;

  avgCarPriceUSD: number;
  avgCarLaborMonths: number;

  avgMedicalCheckupUSD: number;
  avgMedicalCheckupLaborHours: number;
  avgMedicalCheckupPercentOfWage: number;

  /** APPI *of* the continental mean pillar values, mirroring GlobalEconomySummary. */
  avgAppiScore: number;
  avgAppiEssentials: number;
  avgAppiLuxury: number;
  
  categoryLaborHours: {
    staples: number;
    meat: number;
    dairy: number;
    produce: number;
    oil: number;
  };
  tierDistribution: {
    Low: number;
    Moderate: number;
    High: number;
    Severe: number;
  };
  bestCountry: ProcessedCountryEconomy;
  worstCountry: ProcessedCountryEconomy;
  countries: ProcessedCountryEconomy[];
}

export type ThemeName = "light" | "dark" | "theme-latte" | "theme-frappe" | "theme-macchiato" | "theme-mocha";

export interface ThemeOption {
  id: ThemeName;
  name: string;
  type: "light" | "dark";
  badge: string;
  previewColors: string[]; // hex codes for UI preview
}
