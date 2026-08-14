import type { PublishedSiteTestimonial } from "@/features/reviews/server/site-testimonial.types";

/** Defines the public-read persistence boundary for curated testimonial content. */
export interface SiteTestimonialRepository {
  listPublished(): Promise<ReadonlyArray<PublishedSiteTestimonial>>;
}
