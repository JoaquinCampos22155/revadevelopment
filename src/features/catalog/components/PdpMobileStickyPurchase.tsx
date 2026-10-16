"use client";

import { useEffect, useState } from "react";

import { AddToCartButton } from "@/features/cart/components/AddToCartButton";

type PdpMobileStickyPurchaseProps = Readonly<{
  price: string;
  product: Readonly<{ slug: string; title: string }>;
}>;

/** Offers the same Cart action only after its inline counterpart has left the viewport. */
export function PdpMobileStickyPurchase({ price, product }: PdpMobileStickyPurchaseProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById("pdp-primary-action");
    const main = document.querySelector("main.reva-pdp");
    if (!target || !main || typeof IntersectionObserver === "undefined") return;

    let primaryIsVisible = false;
    let primaryIsAbove = false;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === target) {
          primaryIsVisible = entry.isIntersecting;
          primaryIsAbove = Boolean(entry.rootBounds && entry.boundingClientRect.bottom <= entry.rootBounds.top);
        }
      }
      setIsVisible(primaryIsAbove && !primaryIsVisible);
    }, { rootMargin: "-72px 0px 0px 0px", threshold: 0.01 });

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const main = document.querySelector("main.reva-pdp");
    const footer = document.querySelector("footer");
    if (!main) return;
    main.classList.toggle("reva-pdp-sticky-visible", isVisible);
    footer?.classList.toggle("reva-pdp-footer-sticky-visible", isVisible);
    return () => {
      main.classList.remove("reva-pdp-sticky-visible");
      footer?.classList.remove("reva-pdp-footer-sticky-visible");
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="reva-pdp-sticky-purchase md:hidden">
      <p className="shrink-0 font-medium tabular-nums text-reva-primary">{price}</p>
      <AddToCartButton product={product} />
    </div>
  );
}
