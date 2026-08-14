import type { PublishedSiteTestimonial } from "@/features/reviews/server/site-testimonial.types";

/** Supplies curated social proof without introducing a public review workflow. */
export interface ReviewService {
  listPublishedSiteTestimonials(): Promise<ReadonlyArray<PublishedSiteTestimonial>>;
}
