export type CheckoutProduct = Readonly<{
  condition: string;
  image: Readonly<{ alt: string; height: number; src: string; width: number }>;
  price: string;
  sizeLabel: string | null;
  slug: string;
  title: string;
}>;

export type CheckoutResolvedItem = Readonly<{
  product: CheckoutProduct | null;
  slug: string;
}>;
