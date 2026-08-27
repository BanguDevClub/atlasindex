import type { CountryRawData } from "../lib/types";
import { AFRICA_COUNTRIES } from "./continents/africa";
import { AMERICAS_COUNTRIES } from "./continents/americas";
import { ASIA_COUNTRIES } from "./continents/asia";
import { EUROPE_COUNTRIES } from "./continents/europe";
import { OCEANIA_COUNTRIES } from "./continents/oceania";

/**
 * Universal 195-Nation Dataset for AtlasIndex (2025/2026).
 * Includes all 193 United Nations Member States plus 2 Permanent UN Observer States
 * (Holy See / Vatican City and the State of Palestine).
 *
 * Econometrically modeled estimates with explicit disclaimers are provided for economies
 * with restricted statistical transparency or active conflict situations (e.g. North Korea,
 * Eritrea, Syria, Afghanistan, Cuba, Somalia, Yemen, South Sudan).
 */
export const RAW_COUNTRIES: CountryRawData[] = [
  ...AFRICA_COUNTRIES,
  ...AMERICAS_COUNTRIES,
  ...ASIA_COUNTRIES,
  ...EUROPE_COUNTRIES,
  ...OCEANIA_COUNTRIES,
];
