/**
 * Represents money without silently converting PostgreSQL numeric values into
 * JavaScript floating-point numbers.
 */
export type Money = Readonly<{
  amount: string;
  currency: "GTQ";
}>;
