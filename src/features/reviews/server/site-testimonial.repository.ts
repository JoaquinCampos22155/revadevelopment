import type { SiteTestimonial } from "@/features/reviews/server/site-testimonial.types";

/** Defines the persistence boundary for curated site testimonials without assuming future user reviews. */
export interface SiteTestimonialRepository {
  listPublished(): Promise<ReadonlyArray<SiteTestimonial>>;
}
