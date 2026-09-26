TRUNCATE TABLE "Payment", "OrderItem", "GuaranteeHold", "WalletTransaction", "Refund", "Review", "Subscription", "AbandonedCart", "Notification", "RankingRecord", "Order" CASCADE;

UPDATE "Product" SET "salesCount" = 0, "reviewsCount" = 0;
UPDATE "AffiliateProduct" SET "conversionsCount" = 0, "clicksCount" = 0;
UPDATE "Wallet" SET "availableBalance" = 0.0, "pendingBalance" = 0.0, "withdrawnBalance" = 0.0, "totalBalance" = 0.0;
