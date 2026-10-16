/** Adds canonical GTQ amounts as integer cents instead of floating-point values. */
export function cartSubtotal(prices: ReadonlyArray<string>): string {
  const cents = prices.reduce((total, price) => {
    const amount = price.replace(/^Q\s*/, "");
    if (!/^\d+\.\d{2}$/.test(amount)) return total;
    const [whole, fraction] = amount.split(".");
    return total + Number(whole) * 100 + Number(fraction);
  }, 0);
  return `Q ${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
}
