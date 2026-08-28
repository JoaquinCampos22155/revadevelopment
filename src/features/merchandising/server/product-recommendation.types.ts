export type ProductRecommendation = Readonly<{
  position: number;
  productId: string;
  sku: string;
  title: string;
}>;

export type ProductRecommendationStatus = Readonly<{
  eligible: boolean;
  position: number | null;
}>;
