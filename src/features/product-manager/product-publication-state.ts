export type ProductPublicationState = Readonly<{ error: string | null; success: string | null }>;
export const initialProductPublicationState: ProductPublicationState = { error: null, success: null };
