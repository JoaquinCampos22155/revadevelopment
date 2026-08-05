import { NavLink } from "@/components/common/NavLink";

/** Gives the shared text mark enough typographic presence to anchor REVA's global navigation. */
export function BrandLogo() {
  return <NavLink aria-label="REVA: ir al inicio" className="font-serif text-2xl font-medium tracking-[0.16em] text-slate-950" href="/">REVA</NavLink>;
}
