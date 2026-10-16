"use client";

import { Button } from "@/components/ui/Button";
import { useCart } from "@/features/cart/cart-context";

type AddToCartButtonProps = Readonly<{ product: Readonly<{ slug: string; title: string }> }>;

/** Saves only the public slug; a repeated click opens the existing selection instead of duplicating it. */
export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem, items, openDrawer } = useCart();
  const inCart = items.includes(product.slug);

  return (
    <Button
      aria-label={inCart ? `${product.title} está en tu carrito. Ver selección.` : `Agregar ${product.title} al carrito`}
      className="w-full bg-reva-surface text-reva-primary hover:bg-reva-muted"
      onClick={() => inCart ? openDrawer() : addItem(product.slug, product.title)}
      variant="solid"
    >
      {inCart ? <span className="reva-cart-added inline-flex items-center gap-2" key="added"><span aria-hidden="true">✓</span><span>En tu carrito · Ver selección</span></span> : <span key="add">Agregar al carrito</span>}
    </Button>
  );
}
