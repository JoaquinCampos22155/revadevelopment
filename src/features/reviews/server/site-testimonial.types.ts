/** Identifies a curated REVA testimonial independently from persistence. */
export type SiteTestimonialId = string;

/** Represents approved trust content that is not a product review. */
export type SiteTestimonial = Readonly<{
  authorName: string;
  id: SiteTestimonialId;
  quote: string;
  sourceLabel: string;
}>;
