export interface CountryInfo {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  phonePrefix: string;
  withdrawalMethods: string[];
}

export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rateToUsd: number; // 1 USD = rateToUsd in Local Currency
  rateToUyu: number; // 1 UYU = rateToUyu in Local Currency
}

// 28+ Supported Countries Registry
export const COUNTRIES: Record<string, CountryInfo> = {
  UY: {
    code: "UY",
    name: "Uruguay",
    currency: "UYU",
    currencySymbol: "$U",
    flag: "🇺🇾",
    phonePrefix: "+598",
    withdrawalMethods: ["BROU / Transferencia Bancaria", "Tarjeta Prex Uruguay", "Mercado Pago Uruguay"],
  },
  US: {
    code: "US",
    name: "Estados Unidos",
    currency: "USD",
    currencySymbol: "$",
    flag: "🇺🇸",
    phonePrefix: "+1",
    withdrawalMethods: ["ACH Transfer Direct", "PayPal", "Stripe Connect Direct"],
  },
  BR: {
    code: "BR",
    name: "Brasil",
    currency: "BRL",
    currencySymbol: "R$",
    flag: "🇧🇷",
    phonePrefix: "+55",
    withdrawalMethods: ["Chave PIX (CPF / CNPJ / Email)", "TED / DOC Bancário"],
  },
  MX: {
    code: "MX",
    name: "México",
    currency: "MXN",
    currencySymbol: "$",
    flag: "🇲🇽",
    phonePrefix: "+52",
    withdrawalMethods: ["SPEI Transferencia CLABE", "Mercado Pago México", "Tarjeta Débito"],
  },
  AR: {
    code: "AR",
    name: "Argentina",
    currency: "ARS",
    currencySymbol: "$",
    flag: "🇦🇷",
    phonePrefix: "+54",
    withdrawalMethods: ["Transferencia CBU / CVU", "Mercado Pago Argentina", "Dólar Cripto USDT"],
  },
  CL: {
    code: "CL",
    name: "Chile",
    currency: "CLP",
    currencySymbol: "$",
    flag: "🇨🇱",
    phonePrefix: "+56",
    withdrawalMethods: ["Transferencia Cuenta RUT / Bancaria", "Khipu Direct"],
  },
  CO: {
    code: "CO",
    name: "Colombia",
    currency: "COP",
    currencySymbol: "$",
    flag: "🇨🇴",
    phonePrefix: "+57",
    withdrawalMethods: ["Transferencia Bancolombia / Nequi / Daviplata", "PSE Transfer"],
  },
  PE: {
    code: "PE",
    name: "Perú",
    currency: "PEN",
    currencySymbol: "S/.",
    flag: "🇵🇪",
    phonePrefix: "+51",
    withdrawalMethods: ["Yape / Plin", "Transferencia Interbancaria CCI (BCP/BBVA)"],
  },
  CA: {
    code: "CA",
    name: "Canadá",
    currency: "CAD",
    currencySymbol: "CA$",
    flag: "🇨🇦",
    phonePrefix: "+1",
    withdrawalMethods: ["Interac e-Transfer", "Direct Bank Deposit", "PayPal"],
  },
  ES: {
    code: "ES",
    name: "España",
    currency: "EUR",
    currencySymbol: "€",
    flag: "🇪🇸",
    phonePrefix: "+34",
    withdrawalMethods: ["Transferencia SEPA / IBAN", "Bizum Business", "PayPal"],
  },
  PA: {
    code: "PA",
    name: "Panamá",
    currency: "USD",
    currencySymbol: "$",
    flag: "🇵🇦",
    phonePrefix: "+507",
    withdrawalMethods: ["Yappy Banco General", "ACH Panamá"],
  },
  CR: {
    code: "CR",
    name: "Costa Rica",
    currency: "CRC",
    currencySymbol: "₡",
    flag: "🇨🇷",
    phonePrefix: "+506",
    withdrawalMethods: ["SINPE Móvil", "Transferencia IBAN"],
  },
  DO: {
    code: "DO",
    name: "República Dominicana",
    currency: "DOP",
    currencySymbol: "RD$",
    flag: "🇩🇴",
    phonePrefix: "+1",
    withdrawalMethods: ["Transferencia ACH Banreservas / BHD / Popular"],
  },
  EC: {
    code: "EC",
    name: "Ecuador",
    currency: "USD",
    currencySymbol: "$",
    flag: "🇪🇨",
    phonePrefix: "+593",
    withdrawalMethods: ["Transferencia Deuna! / Banco Pichincha / Guayaquil"],
  },
  PY: {
    code: "PY",
    name: "Paraguay",
    currency: "PYG",
    currencySymbol: "₲",
    flag: "🇵🇾",
    phonePrefix: "+595",
    withdrawalMethods: ["SIPAP Transferencia Bancaria", "Billetera Tigo Money"],
  },
  BO: {
    code: "BO",
    name: "Bolivia",
    currency: "BOB",
    currencySymbol: "Bs",
    flag: "🇧🇴",
    phonePrefix: "+591",
    withdrawalMethods: ["Cobro Simple QR / Transferencia Bancaria"],
  },
  GT: {
    code: "GT",
    name: "Guatemala",
    currency: "GTQ",
    currencySymbol: "Q",
    flag: "🇬🇹",
    phonePrefix: "+502",
    withdrawalMethods: ["Transferencia ACH Guate / Banco Industrial"],
  },
  HN: {
    code: "HN",
    name: "Honduras",
    currency: "HNL",
    currencySymbol: "L",
    flag: "🇭🇳",
    phonePrefix: "+504",
    withdrawalMethods: ["Transferencia ACH Pronto"],
  },
  SV: {
    code: "SV",
    name: "El Salvador",
    currency: "USD",
    currencySymbol: "$",
    flag: "🇸🇻",
    phonePrefix: "+503",
    withdrawalMethods: ["Transferencia Uni ACH", "Chivo Wallet / Lightning"],
  },
  NI: {
    code: "NI",
    name: "Nicaragua",
    currency: "NIO",
    currencySymbol: "C$",
    flag: "🇳🇮",
    phonePrefix: "+505",
    withdrawalMethods: ["Transferencia ACH BAC / Lafise"],
  },
  BZ: {
    code: "BZ",
    name: "Belice",
    currency: "BZD",
    currencySymbol: "BZ$",
    flag: "🇧🇿",
    phonePrefix: "+501",
    withdrawalMethods: ["Belize Bank Wire"],
  },
  JM: {
    code: "JM",
    name: "Jamaica",
    currency: "JMD",
    currencySymbol: "J$",
    flag: "🇯🇲",
    phonePrefix: "+1",
    withdrawalMethods: ["NCB / Scotia Direct"],
  },
  TT: {
    code: "TT",
    name: "Trinidad y Tobago",
    currency: "TTD",
    currencySymbol: "TT$",
    flag: "🇹🇹",
    phonePrefix: "+1",
    withdrawalMethods: ["Republic Bank Direct"],
  },
  BS: {
    code: "BS",
    name: "Bahamas",
    currency: "BSD",
    currencySymbol: "B$",
    flag: "🇧🇸",
    phonePrefix: "+1",
    withdrawalMethods: ["Sand Dollar / Local Wire"],
  },
  BB: {
    code: "BB",
    name: "Barbados",
    currency: "BBD",
    currencySymbol: "Bds$",
    flag: "🇧🇧",
    phonePrefix: "+1",
    withdrawalMethods: ["Barbados ACH"],
  },
  GY: {
    code: "GY",
    name: "Guyana",
    currency: "GYD",
    currencySymbol: "GY$",
    flag: "🇬🇾",
    phonePrefix: "+592",
    withdrawalMethods: ["MMG / Guyana Wire"],
  },
  SR: {
    code: "SR",
    name: "Surinam",
    currency: "SRD",
    currencySymbol: "Sr$",
    flag: "🇸🇷",
    phonePrefix: "+597",
    withdrawalMethods: ["Suriname Central Wire"],
  },
  VE: {
    code: "VE",
    name: "Venezuela",
    currency: "VES",
    currencySymbol: "Bs.",
    flag: "🇻🇪",
    phonePrefix: "+58",
    withdrawalMethods: ["Pago Móvil Interbancario", "USDT Binance P2P Direct"],
  },
  HT: {
    code: "HT",
    name: "Haití",
    currency: "HTG",
    currencySymbol: "G",
    flag: "🇭🇹",
    phonePrefix: "+509",
    withdrawalMethods: ["MonCash / Sogebank"],
  },
  CU: {
    code: "CU",
    name: "Cuba",
    currency: "CUP",
    currencySymbol: "$",
    flag: "🇨🇺",
    phonePrefix: "+53",
    withdrawalMethods: ["Tarjeta EnZona / Transfermóvil"],
  },
};

// Exchange rates relative to USD (1 USD = X local units)
// and UYU (Base calculation standard)
// 1 USD approx = 40 UYU
export const CURRENCY_RATES: Record<string, CurrencyRate> = {
  USD: { code: "USD", name: "Dólar Estadounidense", symbol: "$", rateToUsd: 1.0, rateToUyu: 0.025 },
  UYU: { code: "UYU", name: "Peso Uruguayo", symbol: "$U", rateToUsd: 40.0, rateToUyu: 1.0 },
  BRL: { code: "BRL", name: "Real Brasileño", symbol: "R$", rateToUsd: 5.4, rateToUyu: 0.135 },
  MXN: { code: "MXN", name: "Peso Mexicano", symbol: "$", rateToUsd: 19.5, rateToUyu: 0.4875 },
  ARS: { code: "ARS", name: "Peso Argentino", symbol: "$", rateToUsd: 1250.0, rateToUyu: 31.25 },
  CLP: { code: "CLP", name: "Peso Chileno", symbol: "$", rateToUsd: 940.0, rateToUyu: 23.5 },
  COP: { code: "COP", name: "Peso Colombiano", symbol: "$", rateToUsd: 4200.0, rateToUyu: 105.0 },
  PEN: { code: "PEN", name: "Sol Peruano", symbol: "S/.", rateToUsd: 3.75, rateToUyu: 0.09375 },
  CAD: { code: "CAD", name: "Dólar Canadiense", symbol: "CA$", rateToUsd: 1.36, rateToUyu: 0.034 },
  EUR: { code: "EUR", name: "Euro", symbol: "€", rateToUsd: 0.92, rateToUyu: 0.023 },
  CRC: { code: "CRC", name: "Colón Costarricense", symbol: "₡", rateToUsd: 520.0, rateToUyu: 13.0 },
  DOP: { code: "DOP", name: "Peso Dominicano", symbol: "RD$", rateToUsd: 59.5, rateToUyu: 1.4875 },
  PYG: { code: "PYG", name: "Guaraní Paraguayo", symbol: "₲", rateToUsd: 7600.0, rateToUyu: 190.0 },
  BOB: { code: "BOB", name: "Boliviano", symbol: "Bs", rateToUsd: 6.9, rateToUyu: 0.1725 },
  GTQ: { code: "GTQ", name: "Quetzal Guatemalteco", symbol: "Q", rateToUsd: 7.75, rateToUyu: 0.19375 },
  HNL: { code: "HNL", name: "Lempira Hondureño", symbol: "L", rateToUsd: 24.8, rateToUyu: 0.62 },
  NIO: { code: "NIO", name: "Córdoba Nicaragüense", symbol: "C$", rateToUsd: 36.8, rateToUyu: 0.92 },
  VES: { code: "VES", name: "Bolívar Soberano", symbol: "Bs.", rateToUsd: 37.0, rateToUyu: 0.925 },
};

/**
 * Base FALKO Platform Fee is 25 UYU.
 * Converts 25 UYU to the transaction currency.
 */
export function calculatePlatformFee(targetCurrency: string, baseFeeUyu = 25): {
  feeInUyu: number;
  feeConverted: number;
  currency: string;
} {
  const currencyInfo = CURRENCY_RATES[targetCurrency] || CURRENCY_RATES["USD"];
  
  if (targetCurrency === "UYU") {
    return {
      feeInUyu: baseFeeUyu,
      feeConverted: baseFeeUyu,
      currency: "UYU",
    };
  }

  // Convert UYU to target currency: (baseFeeUyu / rateToUyu of UYU which is 40 UYU per 1 USD) * rateToUsd of target
  // In our table, rateToUyu gives 1 UYU = X Target Currency
  const rateToUyu = currencyInfo.rateToUyu;
  const converted = parseFloat((baseFeeUyu * rateToUyu).toFixed(2));

  return {
    feeInUyu: baseFeeUyu,
    feeConverted: converted,
    currency: targetCurrency,
  };
}

/**
 * Split order finances safely with zero client manipulation
 */
export interface FinancialSplit {
  totalAmount: number;
  currencyCode: string;
  affiliateCommissionPct: number;
  affiliateCommissionAmount: number;
  platformFeeUyu: number;
  platformFeeConverted: number;
  sellerEarningAmount: number;
  salesVolumeUsd: number;
}

export function computeFinancialSplit(params: {
  productPrice: number;
  currencyCode: string;
  affiliateCommissionPct: number;
  hasAffiliate: boolean;
  basePlatformFeeUyu?: number;
}): FinancialSplit {
  const { productPrice, currencyCode, affiliateCommissionPct, hasAffiliate, basePlatformFeeUyu = 25 } = params;

  // 1. Calculate affiliate commission
  const commPct = hasAffiliate ? Math.max(0, Math.min(affiliateCommissionPct, 90)) : 0;
  const affiliateCommissionAmount = parseFloat(((productPrice * commPct) / 100).toFixed(2));

  // 2. Calculate platform fee
  const platformFee = calculatePlatformFee(currencyCode, basePlatformFeeUyu);
  let platformFeeConverted = platformFee.feeConverted;

  // Safety safeguard: Platform fee + affiliate commission cannot exceed total product price
  const maxPossiblePlatformFee = Math.max(0, productPrice - affiliateCommissionAmount);
  if (platformFeeConverted > maxPossiblePlatformFee) {
    platformFeeConverted = parseFloat((maxPossiblePlatformFee * 0.1).toFixed(2)); // safe fallback
  }

  // 3. Calculate seller earning (Remainder)
  const sellerEarningAmount = parseFloat((productPrice - affiliateCommissionAmount - platformFeeConverted).toFixed(2));

  // 4. Convert total sales volume to USD for global ranking
  const currencyInfo = CURRENCY_RATES[currencyCode] || CURRENCY_RATES["USD"];
  const salesVolumeUsd = parseFloat((productPrice / (currencyInfo.rateToUsd || 1.0)).toFixed(2));

  return {
    totalAmount: productPrice,
    currencyCode,
    affiliateCommissionPct: commPct,
    affiliateCommissionAmount,
    platformFeeUyu: platformFee.feeInUyu,
    platformFeeConverted,
    sellerEarningAmount: Math.max(0, sellerEarningAmount),
    salesVolumeUsd,
  };
}

/**
 * Format currency nicely
 */
export function formatCurrency(amount: number, currencyCode = "USD"): string {
  const rate = CURRENCY_RATES[currencyCode];
  const symbol = rate ? rate.symbol : "$";
  return `${symbol}${amount.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currencyCode}`;
}

/**
 * Convert any amount from one currency to another
 */
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return amount;
  const fromRate = CURRENCY_RATES[fromCurrency] || CURRENCY_RATES["USD"];
  const toRate = CURRENCY_RATES[toCurrency] || CURRENCY_RATES["USD"];
  
  // Convert from -> USD -> to
  const inUsd = amount / fromRate.rateToUsd;
  const converted = inUsd * toRate.rateToUsd;
  return parseFloat(converted.toFixed(2));
}
