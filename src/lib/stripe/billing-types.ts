export type BillingPaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
};

export type BillingInvoice = {
  id: string;
  number: string | null;
  status: string | null;
  amountDue: number;
  amountPaid: number;
  currency: string;
  created: number;
  periodStart: number | null;
  periodEnd: number | null;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
};

export type BillingSubscription = {
  id: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: number | null;
  planName: string | null;
  planInterval: string | null;
};

export const CANCEL_REASONS = [
  {
    id: "too_expensive",
    label: "It's too expensive right now",
    stripeFeedback: "too_expensive" as const,
  },
  {
    id: "unused",
    label: "I'm not using it enough",
    stripeFeedback: "unused" as const,
  },
  {
    id: "passed_exam",
    label: "I already passed my exam",
    stripeFeedback: "other" as const,
  },
  {
    id: "payment_issues",
    label: "I keep having payment problems",
    stripeFeedback: "other" as const,
  },
  {
    id: "missing_features",
    label: "It's missing something I need",
    stripeFeedback: "missing_features" as const,
  },
  {
    id: "other",
    label: "Something else",
    stripeFeedback: "other" as const,
  },
] as const;

export type CancelReasonId = (typeof CANCEL_REASONS)[number]["id"];

export function isCancelReasonId(value: string): value is CancelReasonId {
  return CANCEL_REASONS.some((reason) => reason.id === value);
}
