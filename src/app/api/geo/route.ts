import { NextRequest, NextResponse } from "next/server";
import { COUNTRIES, CURRENCY_RATES } from "@/lib/currency";

export async function GET(req: NextRequest) {
  // 1. Detect country from Vercel / Cloudflare geolocation headers
  const countryHeader =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    req.headers.get("x-country") ||
    "";

  let detectedCountry = countryHeader.toUpperCase().trim();

  // If no country header (e.g. localhost), fallback to UY / US
  if (!detectedCountry || !COUNTRIES[detectedCountry]) {
    detectedCountry = "UY";
  }

  const countryInfo = COUNTRIES[detectedCountry] || COUNTRIES["US"];

  return NextResponse.json({
    success: true,
    countryCode: detectedCountry,
    countryName: countryInfo.name,
    flag: countryInfo.flag,
    currency: countryInfo.currency,
    currencySymbol: countryInfo.currencySymbol,
    phonePrefix: countryInfo.phonePrefix,
  });
}
