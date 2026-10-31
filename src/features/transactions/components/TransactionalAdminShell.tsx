import type { ReactNode } from "react";

import { AdminSectionNavigation } from "@/components/layout/AdminSectionNavigation";

type TransactionalAdminShellProps = Readonly<{
  activeTab: "requests" | "orders";
  children: ReactNode;
}>;

export function TransactionalAdminShell({ activeTab, children }: TransactionalAdminShellProps) {
  return (
    <div className={activeTab === "requests"
      ? "relative isolate overflow-hidden bg-[linear-gradient(145deg,#f7f8fa_0%,#fbfcfd_56%,#f4f6f8_100%)]"
      : "relative isolate overflow-hidden bg-[linear-gradient(145deg,#eef4f7_0%,#fbfcfd_55%,#f2f6f8_100%)]"}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden text-slate-500/[0.06]">
        {activeTab === "requests" ? (
          <svg className="absolute -left-8 top-36 h-56 w-64 rotate-[-8deg]" fill="none" viewBox="0 0 240 170">
            <path d="M24 48h130l24 23v70H24zM154 48v24h24M24 84h154M54 48V26h70v22M71 107h36" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
            <path d="m40 48 14 23m15-23 14 23m15-23 14 23" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        ) : (
          <svg className="absolute bottom-[-2rem] right-[-1rem] hidden h-64 w-56 rotate-[7deg] md:block" fill="none" viewBox="0 0 180 210">
            <path d="M31 36h118v142H31zM31 68h118M50 53h26m12 0h42M55 93h69m-69 19h69m-69 19h45" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
            <path d="M52 148h30m-30 13h55" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        )}
      </div>
      <div className="relative z-10">
        <div className="mx-auto w-full max-w-7xl">
          <AdminSectionNavigation activeSection={activeTab} />
        </div>
        {children}
      </div>
    </div>
  );
}
