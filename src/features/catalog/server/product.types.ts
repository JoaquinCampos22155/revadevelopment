/** Identifies a unique garment independently from its future persistence provider. */
export type ProductId = string;

/** Identifies a public, human-readable product route. */
export type ProductSlug = string;

/** Models the only lifecycle states approved for a unique REVA garment. */
export type ProductStatus = "draft" | "published" | "reserved" | "sold" | "archived";

/** Identifies the editorial purpose of an image owned by a product. */
export type ProductImageKind = "front" | "back" | "detail" | "closeup";

/** Represents a reusable product brand without coupling it to a database row. */
export type Brand = Readonly<{
  id: string;
  name: string;
  slug: string;
}>;

/** Represents a discovery category that products can reference. */
export type Category = Readonly<{
  id: string;
  name: string;
  slug: string;
}>;

/** Keeps product image ownership and provider-neutral storage references together. */
export type ProductImage = Readonly<{
  altText: string;
  id: string;
  kind: ProductImageKind;
  productId: ProductId;
  sortOrder: number;
  storageKey: string;
}>;

/** Describes a unique garment and the facts required to manage its lifecycle. */
export type Product = Readonly<{
  brandId: Brand["id"];
  categoryId: Category["id"];
  conditionDescription: string;
  description: string;
  highlights: ReadonlyArray<string>;
  id: ProductId;
  name: string;
  sizeLabel: string;
  slug: ProductSlug;
  status: ProductStatus;
}>;

/** Supplies only the data necessary to create an unpublished product draft. */
export type CreateProductDraftInput = Readonly<{
  brandId: Brand["id"];
  categoryId: Category["id"];
  conditionDescription: string;
  description: string;
  highlights: ReadonlyArray<string>;
  name: string;
  sizeLabel: string;
  slug: ProductSlug;
}>;

/** Limits changes to fields that remain editable before a product lifecycle transition. */
export type UpdateProductDraftInput = Readonly<{
  brandId?: Brand["id"];
  categoryId?: Category["id"];
  conditionDescription?: string;
  description?: string;
  highlights?: ReadonlyArray<string>;
  id: ProductId;
  name?: string;
  sizeLabel?: string;
  slug?: ProductSlug;
}>;

/** Makes a lifecycle transition explicit rather than allowing arbitrary status updates in UI code. */
export type ChangeProductStatusInput = Readonly<{
  id: ProductId;
  status: ProductStatus;
}>;

/** Supplies the facts required by catalog discovery without exposing provider data. */
export type PublishedProductPreview = Readonly<{
  brandName: string;
  categoryName: string;
  conditionDescription: string;
  id: ProductId;
  name: string;
  slug: ProductSlug;
  thumbnail: ProductImage | null;
}>;

/** Supplies the published detail model shared by pages, metadata, and future structured data. */
export type PublishedProduct = Readonly<{
  brand: Brand;
  category: Category;
  conditionDescription: string;
  description: string;
  highlights: ReadonlyArray<string>;
  id: ProductId;
  images: ReadonlyArray<ProductImage>;
  name: string;
  sizeLabel: string;
  slug: ProductSlug;
}>;

/** Limits future catalog reads without exposing persistence query formats. */
export type ListPublishedProductsInput = Readonly<{
  categorySlug?: Category["slug"];
  limit?: number;
}>;
