export type RoleType = "BUYER" | "SELLER" | "AFFILIATE" | "ADMIN";

export type ProductStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "SUSPENDED";

export type AffiliateApprovalMode = "AUTO" | "MANUAL";

export type AffiliateProductStatus = "PENDING" | "APPROVED" | "REJECTED";

export type OrderStatus = "PENDING" | "CONFIRMED" | "REFUNDED" | "FAILED";

export type TransactionType =
  | "ORDER_CREATED"
  | "PAYMENT_PENDING"
  | "PAYMENT_CONFIRMED"
  | "PLATFORM_COMMISSION"
  | "AFFILIATE_COMMISSION"
  | "SELLER_EARNING"
  | "GUARANTEE_HOLD"
  | "GUARANTEE_RELEASE"
  | "REFUND"
  | "REFUND_REVERSAL"
  | "WITHDRAWAL_REQUESTED"
  | "WITHDRAWAL_PROCESSING"
  | "WITHDRAWAL_PAID"
  | "WITHDRAWAL_REJECTED"
  | "ADJUSTMENT";

export type GuaranteeStatus = "HELD" | "RELEASED" | "REVERSED";

export type WithdrawalStatus = "PENDING" | "PROCESSING" | "PAID" | "REJECTED";

export type RefundStatus = "REQUESTED" | "APPROVED" | "REJECTED";

export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  preferredCurrency: string;
  roles: RoleType[];
  affiliateCode?: string;
  isSuspended: boolean;
}
