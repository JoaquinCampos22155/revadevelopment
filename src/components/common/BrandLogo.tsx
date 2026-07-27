import { NavLink } from "@/components/common/NavLink";

/** Renders REVA's shared text brand mark in the global navigation. */
export function BrandLogo() {
  return (
    <NavLink
      aria-label="REVA: ir al inicio"
      className="font-sans text-lg font-semibold tracking-tight"
      href="/"
    >
      REVA
    </NavLink>
  );
}
