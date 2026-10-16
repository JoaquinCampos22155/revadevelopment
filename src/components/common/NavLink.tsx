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
      aria-current={pathname === href ? "page" : undefined}
      className={className}
      href={href}
      onClick={(event) => {
        if (
          pathname !== href
          || event.defaultPrevented
          || event.button !== 0
          || event.metaKey
          || event.ctrlKey
          || event.shiftKey
          || event.altKey
        ) return;

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
