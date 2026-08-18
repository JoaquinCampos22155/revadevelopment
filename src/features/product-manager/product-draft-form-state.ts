/**
 * Defines the serializable UI state shared by Product Manager actions and the
 * interactive form without turning a Server Action module into a value module.
 */
export type ProductDraftFormState = Readonly<{
  error: string | null;
  saved: boolean;
}>;

/** Provides one neutral initial state for both Product draft create and edit flows. */
export const initialProductDraftFormState: ProductDraftFormState = {
  error: null,
  saved: false,
};
