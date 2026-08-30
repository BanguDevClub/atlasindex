import type { FoodPriceItem } from "../lib/types";

export const BASKET_ITEMS: FoodPriceItem[] = [
  {
    id: "rice",
    name: "White Rice (Long Grain)",
    category: "staple",
    unit: "1 kg",
    quantityInMonthlyBasket: 5.0, // 5 kg / month
    iconName: "Wheat",
  },
  {
    id: "beans",
    name: "Dry Beans & Lentils",
    category: "staple",
    unit: "1 kg",
    quantityInMonthlyBasket: 2.5, // 2.5 kg / month
    iconName: "CircleDot",
  },
  {
    id: "bread",
    name: "Fresh Bread / Loaf",
    category: "staple",
    unit: "1 kg (two 500g loaves)",
    quantityInMonthlyBasket: 4.0, // 4 kg / month
    iconName: "Sandwich",
  },
  {
    id: "potatoes",
    name: "Potatoes",
    category: "staple",
    unit: "1 kg",
    quantityInMonthlyBasket: 4.0, // 4 kg / month
    iconName: "Apple",
  },
  {
    id: "chicken",
    name: "Chicken Meat (Fillets/Thighs)",
    category: "meat",
    unit: "1 kg",
    quantityInMonthlyBasket: 4.0, // 4 kg / month
    iconName: "Drumstick",
  },
  {
    id: "beef",
    name: "Beef (Round / Minced Beef)",
    category: "meat",
    unit: "1 kg",
    quantityInMonthlyBasket: 2.5, // 2.5 kg / month
    iconName: "Beef",
  },
  {
    id: "eggs",
    name: "Eggs (Grade A)",
    category: "dairy",
    unit: "12 units (Dozen)",
    quantityInMonthlyBasket: 2.5, // 30 eggs total = 2.5 dozen
    iconName: "Egg",
  },
  {
    id: "milk",
    name: "Fresh Milk (Whole / Semi)",
    category: "dairy",
    unit: "1 Liter",
    quantityInMonthlyBasket: 10.0, // 10 L / month
    iconName: "Milk",
  },
  {
    id: "cheese",
    name: "Local Cheese",
    category: "dairy",
    unit: "1 kg",
    quantityInMonthlyBasket: 1.0, // 1 kg / month
    iconName: "PieChart",
  },
  {
    id: "tomatoes",
    name: "Fresh Tomatoes",
    category: "produce",
    unit: "1 kg",
    quantityInMonthlyBasket: 3.0, // 3 kg / month
    iconName: "Citrus",
  },
  {
    id: "onions",
    name: "Onions",
    category: "produce",
    unit: "1 kg",
    quantityInMonthlyBasket: 2.0, // 2 kg / month
    iconName: "Carrot",
  },
  {
    id: "apples",
    name: "Fresh Fruit (Apples / Bananas)",
    category: "produce",
    unit: "1 kg",
    quantityInMonthlyBasket: 4.0, // 4 kg / month
    iconName: "Apple",
  },
  {
    id: "oil",
    name: "Vegetable / Sunflower Oil",
    category: "oil",
    unit: "1 Liter",
    quantityInMonthlyBasket: 2.0, // 2 L / month
    iconName: "Droplet",
  },
];

export const BASKET_NUTRITION_EXPLANATION = {
  calorieTarget: "Approx. ~2,300 kcal per day per adult (2,200–2,400 range, WHO/FAO guidelines)",
  proteinShare: "15% - 20% total caloric intake from mixed animal and legume proteins",
  carbShare: "50% - 55% complex carbohydrates from cereals, grains, and tubers",
  fatShare: "25% - 30% healthy fats from cooking oil, dairy, and eggs",
  micronutrients: "Essential vitamins A, C, potassium, and dietary fiber from produce",
};

export interface BenchmarkPillarSpec {
  id: "food" | "rent" | "car" | "medical";
  name: string;
  unit: string;
  description: string;
  methodologyNote: string;
  iconName: string;
}

export const NON_FOOD_BENCHMARKS: BenchmarkPillarSpec[] = [
  {
    id: "food",
    name: "Nutritional Food Basket",
    unit: "13-Item Monthly Basket",
    description: "Standardized adult caloric requirement of ~2,300 kcal/day adhering to WHO guidelines.",
    methodologyNote: "Computed across 13 weighted grocery staples from national price surveys.",
    iconName: "Utensils",
  },
  {
    id: "rent",
    name: "1-Bedroom Apartment Rent",
    unit: "1 Month Rent",
    description: "Standard median monthly rent for a 1-bedroom residential apartment (national weighted average).",
    methodologyNote: "Compiled from national tenancy registries, census statistics, and international cost-of-living surveys.",
    iconName: "Home",
  },
  {
    id: "car",
    name: "Standard Passenger Car",
    unit: "1 Vehicle Purchase",
    description: "Retail purchase price for a new entry-level / compact passenger vehicle (e.g. Toyota Corolla / VW Golf equivalent).",
    methodologyNote: "Includes standard import tariffs, value-added taxes, and vehicle registration benchmarks.",
    iconName: "Car",
  },
  {
    id: "medical",
    name: "Routine Medical Checkup & Lab Exam",
    unit: "1 Comprehensive Outpatient Checkup",
    description: "Standard routine health exam: Doctor clinical consultation + Complete Blood Count (CBC) + Fasting Glucose + Lipid Profile + Metabolic Panel.",
    methodologyNote: "Standard outpatient fee without insurance subsidies from health ministry price lists and WHO health accounts.",
    iconName: "Stethoscope",
  },
];
