export interface InvoiceWithSubscription {
  id: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  subscription: string | null;
  attempt_count: number;
  next_payment_attempt: number | null;
}
