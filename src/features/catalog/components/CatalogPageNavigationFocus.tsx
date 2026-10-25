"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

/** Moves keyboard focus to the results heading when numbered-page state changes. */
export function CatalogPageNavigationFocus() {
  const searchParams = useSearchParams();
  const page = searchParams.get("pagina") ?? "1";
  const previousPage = useRef(page);

  useEffect(() => {
    if (previousPage.current === page) return;
    previousPage.current = page;
    document.getElementById("catalog-results")?.focus();
  }, [page]);

  return null;
}
