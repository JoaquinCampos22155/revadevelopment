export type ProductRecommendationActionState = Readonly<{
  error: string | null;
  success: string | null;
}>;

export const initialProductRecommendationActionState: ProductRecommendationActionState = {
  error: null,
  success: null,
};
