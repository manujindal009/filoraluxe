import { ALLOWED_COD_CITIES } from "./config";

/**
 * Checks if Cash on Delivery is available for the given city.
 * Normalizes the city name to uppercase and trims whitespace for accurate comparison.
 */
export function isCODAvailable(city: string): boolean {
  if (!city) return false;
  const normalizedCity = city.trim().toUpperCase();
  return ALLOWED_COD_CITIES.includes(normalizedCity);
}
