export type CartProductView = Readonly<{
  condition: string;
  href: string;
  image: Readonly<{ alt: string; height: number; src: string; width: number }> | null;
  price: string;
  sizeLabel: string | null;
  slug: string;
  title: string;
}>;

export type CartProductResult = Readonly<{
  items: ReadonlyArray<Readonly<{ product: CartProductView | null; slug: string }>>;
  ok: boolean;
}>;
