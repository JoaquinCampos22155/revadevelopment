import Image from "next/image";

import revaIcon from "@/assets/reva-icon.svg";
import { NavLink } from "@/components/common/NavLink";

/** Gives the shared text mark enough typographic presence to anchor REVA's global navigation. */
export function BrandLogo() {
  return <NavLink aria-label="REVA: ir al inicio" className="flex items-center gap-2 font-serif text-2xl font-medium tracking-[0.16em] text-reva-primary" href="/"><Image alt="" aria-hidden="true" height={34} priority src={revaIcon} width={34} /><span>REVA</span></NavLink>;
}
