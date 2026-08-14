/** Identifies curated REVA trust content independently from persistence. */
export type SiteTestimonialId = string;

/** Represents internal editorial state for a curated Site Testimonial. */
export type SiteTestimonial = Readonly<{
  attribution: string;
  authorName: string;
  createdAt: Date;
  id: SiteTestimonialId;
  isPublished: boolean;
  position: number;
  quote: string;
  updatedAt: Date;
}>;

/** Supplies only approved, published testimonial content to public presentation. */
export type PublishedSiteTestimonial = Readonly<{
  attribution: string;
  authorName: string;
  id: SiteTestimonialId;
  position: number;
  quote: string;
}>;
