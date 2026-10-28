import type { ReactNode } from "react";

/** Adds quiet, non-interactive apparel line art behind Product Manager surfaces. */
export function ProductAdminAtmosphere({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="relative isolate overflow-hidden bg-[linear-gradient(145deg,#f5f8fa_0%,#fbfcfd_52%,#f1f5f8_100%)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden text-slate-500/[0.075]">
        <svg className="absolute -left-8 top-28 h-56 w-44 rotate-[-8deg]" fill="none" viewBox="0 0 160 210">
          <path d="m54 20 26 12 26-12 38 25-19 34-17-10v114H52V69L35 79 16 45l38-25Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
          <path d="m54 20 9 33 17 12 17-12 9-33M80 65v118" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <svg className="absolute right-[-2rem] top-[38%] h-64 w-48 rotate-[9deg]" fill="none" viewBox="0 0 150 220">
          <path d="M35 18h80l-8 47 16 134H82l-7-88-8 88H27l15-134-7-47Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
          <path d="M35 18h80M42 65h65M75 65v46" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <svg className="absolute right-[16%] top-[-2rem] hidden h-48 w-40 rotate-[7deg] xl:block" fill="none" viewBox="0 0 150 190">
          <path d="m48 18 27 12 27-12 30 22-16 29-15-9v100H49V60l-15 9-16-29 30-22Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
          <path d="m48 18 9 28 18 12 18-12 9-28M75 58v102" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <svg className="absolute left-[12%] top-[58%] hidden h-44 w-36 rotate-[-7deg] lg:block" fill="none" viewBox="0 0 150 190">
          <path d="M39 22h72l-7 42 25 101H79l-4-62-4 62H21L46 64l-7-42Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
          <path d="M39 22h72M46 64h59M75 64v39" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <svg className="absolute bottom-[-3rem] left-[36%] hidden h-52 w-44 rotate-[-5deg] md:block" fill="none" viewBox="0 0 150 180">
          <path d="m48 18 27 12 27-12 31 22-16 29-15-9v91H48V60l-15 9-16-29 31-22Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
          <path d="m48 18 9 29 18 11 18-11 9-29M75 58v93" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <svg className="absolute bottom-[18%] right-[34%] hidden h-40 w-36 rotate-[6deg] xl:block" fill="none" viewBox="0 0 150 190">
          <path d="m51 18 24 11 24-11 29 21-14 28-14-8v111H50V59l-14 8-14-28 29-21Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
          <path d="m51 18 8 27 16 12 16-12 8-27M75 57v113" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <svg className="absolute bottom-[-2rem] right-[12%] hidden h-44 w-40 rotate-[-6deg] xl:block" fill="none" viewBox="0 0 150 180">
          <path d="m51 14 24 11 24-11 24 18-13 25-12-8v112H52V49l-12 8-13-25 24-18Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
          <path d="m51 14 8 24 16 11 16-11 8-24M75 49v112" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
