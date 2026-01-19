export interface SubscriptionWithDetails {
  id: string;
  customer: string;
  status: string;
  trial_end: number | null;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  items: {
    data: Array<{
      current_period_start: number;
      current_period_end: number;
      price: {
        id: string;
      };
    }>;
  };
  metadata: {
    userId: string;
    plan: string;
  };
}
