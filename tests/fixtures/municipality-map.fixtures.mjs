// TEST ONLY: equal abstract tiles are not Guatemala boundaries and must never
// be imported by or displayed in the customer-facing Checkout prototype.
export const NON_GEOGRAPHIC_MUNICIPALITY_FIXTURES = Array.from({ length: 17 }, (_, index) => {
  const column = index % 5;
  const row = Math.floor(index / 5);
  const x = 30 + column * 190;
  const y = 40 + row * 190;

  return {
    code: `01${String(index + 1).padStart(2, "0")}`,
    path: `M ${x} ${y} h 34 v 34 h -34 z`,
    bounds: { x, y, width: 34, height: 34 },
  };
});
