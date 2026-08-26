export type Continent = "Americas" | "Europe" | "Asia-Pacific" | "Africa & Middle East";

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
  dataYear: number;
  wageSource: string;
  wageSourceUrl: string;
  priceSource: string;
  priceSourceUrl: string;
  notes?: string;
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
  
  // Total Basket Calculations
  monthlyBasketCostLocal: number;
  monthlyBasketCostUSD: number;
  basketPercentOfWage: number;
  laborHoursForBasket: number;

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

  // Indices
  appiScore: number; // 0-100 Atlas Purchasing Power Index
  stressTier: StressTier;
  rank?: number;

  dataYear: number;
  wageSource: string;
  wageSourceUrl: string;
  priceSource: string;
  priceSourceUrl: string;
  notes?: string;
}

export type ThemeName = "light" | "dark" | "theme-latte" | "theme-frappe" | "theme-macchiato" | "theme-mocha";

export interface ThemeOption {
  id: ThemeName;
  name: string;
  type: "light" | "dark";
  badge: string;
  previewColors: string[]; // hex codes for UI preview
}
