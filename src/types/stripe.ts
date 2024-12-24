export type StripeState = {
  status: "idle" | "success" | "error";
  error: string;
  redirectUrl?: string;
};
