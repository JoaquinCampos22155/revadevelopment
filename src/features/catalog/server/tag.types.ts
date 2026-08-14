/** Identifies REVA-controlled discovery configuration. */
export type TagId = string;

/** Limits Tags to the approved non-SEO discovery groups. */
export type TagGroup = "style" | "season";

/**
 * Represents a controlled discovery label. Tags do not own URLs and are never
 * user-generated content.
 */
export type Tag = Readonly<{
  createdAt: Date;
  group: TagGroup;
  id: TagId;
  isFilterVisible: boolean;
  name: string;
  position: number;
  updatedAt: Date;
}>;
