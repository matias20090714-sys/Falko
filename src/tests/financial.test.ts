import { computeFinancialSplit, calculatePlatformFee, formatCurrency, convertCurrency } from "../lib/currency";
import { calculateTierProgress, getTierForVolume, RANKING_TIERS } from "../lib/ranking";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ TEST FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log("\n=========================================");
console.log("🦅 FALKO FINANCIAL & ENGINE UNIT TESTS");
console.log("=========================================\n");

// TEST 1: Exact prompt example in UYU
// Product: 500 UYU, Affiliate: 20%, Platform: 25 UYU -> Affiliate: 100, Platform: 25, Seller: 375
const splitUyu = computeFinancialSplit({
  productPrice: 500,
  currencyCode: "UYU",
  affiliateCommissionPct: 20,
  hasAffiliate: true,
  basePlatformFeeUyu: 25,
});

assert(splitUyu.totalAmount === 500, "Total amount matches 500 UYU");
assert(splitUyu.affiliateCommissionAmount === 100, `Affiliate commission is exactly 100 UYU (got ${splitUyu.affiliateCommissionAmount})`);
assert(splitUyu.platformFeeConverted === 25, `Platform fee is exactly 25 UYU (got ${splitUyu.platformFeeConverted})`);
assert(splitUyu.sellerEarningAmount === 375, `Seller net earning is exactly 375 UYU (got ${splitUyu.sellerEarningAmount})`);
assert(
  splitUyu.affiliateCommissionAmount + splitUyu.platformFeeConverted + splitUyu.sellerEarningAmount === splitUyu.totalAmount,
  "Sum of parts strictly equals 500 UYU with ZERO financial leak"
);

// TEST 2: USD Transaction with converted 25 UYU platform fee
// In USD: 25 UYU / 40 rate = 0.63 USD platform fee
const splitUsd = computeFinancialSplit({
  productPrice: 100,
  currencyCode: "USD",
  affiliateCommissionPct: 30,
  hasAffiliate: true,
  basePlatformFeeUyu: 25,
});

assert(splitUsd.totalAmount === 100, "USD Total amount matches $100");
assert(splitUsd.affiliateCommissionAmount === 30, `Affiliate commission is $30 (got ${splitUsd.affiliateCommissionAmount})`);
assert(splitUsd.platformFeeConverted === 0.63, `Platform fee converted to USD is $0.63 (got ${splitUsd.platformFeeConverted})`);
assert(splitUsd.sellerEarningAmount === 69.37, `Seller earning is $69.37 (got ${splitUsd.sellerEarningAmount})`);
assert(
  parseFloat((splitUsd.affiliateCommissionAmount + splitUsd.platformFeeConverted + splitUsd.sellerEarningAmount).toFixed(2)) === 100,
  "USD Split sum strictly equals $100"
);

// TEST 3: Sale without Affiliate
const splitDirect = computeFinancialSplit({
  productPrice: 200,
  currencyCode: "USD",
  affiliateCommissionPct: 50, // Should be ignored because hasAffiliate is false
  hasAffiliate: false,
  basePlatformFeeUyu: 25,
});

assert(splitDirect.affiliateCommissionAmount === 0, "Affiliate commission is 0 for direct sale");
assert(splitDirect.platformFeeConverted === 0.63, "Platform fee is 0.63 USD");
assert(splitDirect.sellerEarningAmount === 199.37, `Seller receives full amount minus fee (199.37 USD)`);

// TEST 4: Global Ranking Tier and Progress Bar Calculation
// User with $4,500 USD volume generated
const progress1 = calculateTierProgress(4500);
assert(progress1.currentTier.id === "BRONZE", "Current tier is BRONZE for $4,500");
assert(progress1.nextTier?.id === "SILVER", "Next tier is SILVER");
assert(progress1.nextMilestoneUsd === 10000, "Next milestone is $10,000");
assert(progress1.remainingUsd === 5500, "Remaining to next milestone is $5,500");
// Progress within tier: (4500 - 1000) / (10000 - 1000) = 3500 / 9000 = 38.9%
assert(progress1.progressPercent === 38.9, `Progress percent is 38.9% (got ${progress1.progressPercent}%)`);

// User with $0 USD
const progressNovice = calculateTierProgress(0);
assert(progressNovice.currentTier.id === "NOVICE", "Tier is NOVICE for $0");
assert(progressNovice.progressPercent === 0, "Progress is 0% for $0");
assert(progressNovice.nextMilestoneUsd === 1000, "Next milestone is $1,000");

// User with $1,200,000 USD (Apex)
const progressApex = calculateTierProgress(1200000);
assert(progressApex.currentTier.id === "APEX", "Tier is APEX for $1.2M");
assert(progressApex.progressPercent === 100, "Progress is 100% for Apex");
assert(progressApex.nextTier === null, "Next tier is null (Apex is max)");

console.log("\n✨ ALL FINANCIAL & RANKING UNIT TESTS PASSED SUCCESSFULLY!\n");
