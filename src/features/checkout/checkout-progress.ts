export type CheckoutProgressStatus = "complete" | "current" | "future";

export type CheckoutProgressStep = Readonly<{
  label: "Entrega" | "Factura" | "Revisión" | "Pago";
  status: CheckoutProgressStatus;
}>;

/** The current Checkout ends at review; payment remains a future external step. */
export function getCheckoutProgress(reviewReady: boolean): readonly CheckoutProgressStep[] {
  return [
    { label: "Entrega", status: reviewReady ? "complete" : "current" },
    { label: "Factura", status: reviewReady ? "complete" : "future" },
    { label: "Revisión", status: reviewReady ? "current" : "future" },
    { label: "Pago", status: "future" },
  ];
}
