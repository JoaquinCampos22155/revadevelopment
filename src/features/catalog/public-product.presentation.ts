import { audiences } from "@/features/catalog/audiences";
import { colors } from "@/features/catalog/colors";
import { conditionLabels } from "@/features/catalog/condition";
import { garmentTypes } from "@/features/catalog/garment-types";
import type { PublishedProductPreview } from "@/features/catalog/server/product.types";
import type { CatalogProductPreview } from "@/types/catalog";

function labelFor(values:ReadonlyArray<Readonly<{label:string;value:string}>>,value:string):string{return values.find((item)=>item.value===value)?.label??value;}
export function audienceLabel(value:string):string{return labelFor(audiences,value);}
export function garmentTypeLabel(value:string):string{return labelFor(garmentTypes,value);}
export function colorLabel(value:string):string{return labelFor(colors,value);}

/** Adapts safe published contracts to the frozen Catalog card presentation. */
export function toCatalogProductPreview(product:PublishedProductPreview):CatalogProductPreview|null{
  if(!product.image)return null;
  return {category:garmentTypeLabel(product.garmentType),condition:conditionLabels[product.conditionRating],href:`/productos/${product.slug}`,image:{alt:product.image.altText,height:product.image.height,src:product.image.url,width:product.image.width},name:product.title,price:`Q ${product.price.amount}`};
}
