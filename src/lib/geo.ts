import { COUNTRIES } from "./currency";

export interface DetectedGeoInfo {
  countryCode: string;
  currency: string;
  currencySymbol: string;
  phonePrefix: string;
  flag: string;
  name: string;
}

/**
 * Maps standard browser timezones to LATAM/Global country codes
 */
function getCountryFromTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.includes("Montevideo")) return "UY";
    if (tz.includes("Buenos_Aires") || tz.includes("Cordoba") || tz.includes("Argentina")) return "AR";
    if (tz.includes("Sao_Paulo") || tz.includes("Fortaleza") || tz.includes("Manaus") || tz.includes("Recife") || tz.includes("Cuiaba")) return "BR";
    if (tz.includes("Mexico") || tz.includes("Cancun") || tz.includes("Monterrey") || tz.includes("Tijuana") || tz.includes("Hermosillo")) return "MX";
    if (tz.includes("Bogota")) return "CO";
    if (tz.includes("Santiago") || tz.includes("Easter")) return "CL";
    if (tz.includes("Lima")) return "PE";
    if (tz.includes("Madrid") || tz.includes("Canary")) return "ES";
    if (tz.includes("Asuncion")) return "PY";
    if (tz.includes("La_Paz")) return "BO";
    if (tz.includes("Guayaquil") || tz.includes("Galapagos")) return "EC";
    if (tz.includes("New_York") || tz.includes("Chicago") || tz.includes("Los_Angeles") || tz.includes("Denver") || tz.includes("Phoenix")) return "US";
  } catch {
    // fallback
  }
  return "UY"; // Default regional hub
}

/**
 * Automatically detects user country and sets regional currency in localStorage
 */
export async function autoDetectAndApplyGeo(): Promise<DetectedGeoInfo> {
  if (typeof window === "undefined") {
    const defaultCountry = COUNTRIES["UY"];
    return {
      countryCode: "UY",
      currency: defaultCountry.currency,
      currencySymbol: defaultCountry.currencySymbol,
      phonePrefix: defaultCountry.phonePrefix,
      flag: defaultCountry.flag,
      name: defaultCountry.name,
    };
  }

  // 1. Check if we already detected or set a currency
  const existingCurrency = localStorage.getItem("falko_currency");
  const existingCountry = localStorage.getItem("falko_country");

  if (existingCurrency && existingCountry && COUNTRIES[existingCountry]) {
    const countryInfo = COUNTRIES[existingCountry];
    return {
      countryCode: existingCountry,
      currency: existingCurrency,
      currencySymbol: countryInfo.currencySymbol,
      phonePrefix: countryInfo.phonePrefix,
      flag: countryInfo.flag,
      name: countryInfo.name,
    };
  }

  // 2. Instant timezone heuristic
  const tzCountry = getCountryFromTimezone();
  let detectedCode = tzCountry;

  // 3. Optional async header check
  try {
    const res = await fetch("/api/geo");
    if (res.ok) {
      const data = await res.json();
      if (data.countryCode && COUNTRIES[data.countryCode]) {
        detectedCode = data.countryCode;
      }
    }
  } catch {
    // Keep timezone result
  }

  const countryInfo = COUNTRIES[detectedCode] || COUNTRIES["UY"];

  localStorage.setItem("falko_country", detectedCode);
  if (!existingCurrency) {
    localStorage.setItem("falko_currency", countryInfo.currency);
    window.dispatchEvent(new CustomEvent("currencyChange", { detail: countryInfo.currency }));
  }
  localStorage.setItem("falko_geo_detected", "true");

  return {
    countryCode: detectedCode,
    currency: countryInfo.currency,
    currencySymbol: countryInfo.currencySymbol,
    phonePrefix: countryInfo.phonePrefix,
    flag: countryInfo.flag,
    name: countryInfo.name,
  };
}
