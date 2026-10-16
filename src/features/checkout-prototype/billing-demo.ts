export type BillingDemoType = "cf" | "nit";

export type BillingDemoState = Readonly<{
  type: BillingDemoType;
  nit: string;
  recipientName: string;
}>;

export const INITIAL_BILLING_DEMO: BillingDemoState = {
  type: "cf",
  nit: "",
  recipientName: "",
};

export function selectBillingDemoType(current: BillingDemoState, type: BillingDemoType): BillingDemoState {
  return type === "cf"
    ? { type, nit: "", recipientName: "" }
    : { ...current, type };
}

export function updateBillingDemoNit(current: BillingDemoState, nit: string): BillingDemoState {
  return { ...current, nit };
}

export function updateBillingDemoRecipientName(current: BillingDemoState, recipientName: string): BillingDemoState {
  return { ...current, recipientName };
}
