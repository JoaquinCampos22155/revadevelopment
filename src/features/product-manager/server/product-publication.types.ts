/** Represents the only publication gaps communicated to Product Manager. */
export type PublicationRequirement =
  | "audience"
  | "condition"
  | "description"
  | "garment_type"
  | "image"
  | "image_order"
  | "price"
  | "private_media"
  | "sizing";

export type ProductPublicationReadiness = Readonly<{
  missing: ReadonlyArray<PublicationRequirement>;
}>;
