import type { ReactNode } from "react";

import { PageContainer } from "@/components/layout/PageContainer";

type SectionProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

/** Creates a semantic page section with centrally managed major spacing. */
export function Section({ children, className }: SectionProps) {
  return (
    <section className={["py-12 sm:py-20", className].filter(Boolean).join(" ")}>
      <PageContainer>{children}</PageContainer>
    </section>
  );
}
