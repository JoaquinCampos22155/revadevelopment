"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavLinkProps = Readonly<{
  "aria-label"?: string;
  children: ReactNode;
  className?: string;
  href: string;
}>;

/** Preserves crawlable links while returning same-route navigation to the page start. */
export function NavLink({ children, className, href, ...linkProps }: NavLinkProps) {
  const pathname = usePathname();

  return (
    <Link
      className={className}
      href={href}
      onClick={(event) => {
        if (pathname !== href) return;

        event.preventDefault();
        const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
          .matches
          ? "auto"
          : "smooth";

        window.scrollTo({ top: 0, behavior });
      }}
      {...linkProps}
    >
      {children}
    </Link>
  );
}
