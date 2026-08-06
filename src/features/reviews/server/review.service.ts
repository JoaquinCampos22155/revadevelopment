import type { SiteTestimonial } from "@/features/reviews/server/site-testimonial.types";

/** Supplies reviewed social-proof content while keeping future customer-review policy separate. */
export interface ReviewService {
  listPublishedSiteTestimonials(): Promise<ReadonlyArray<SiteTestimonial>>;
}
