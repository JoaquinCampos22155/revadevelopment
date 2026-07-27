import type { ReactNode } from "react";

import { PageContainer } from "@/components/layout/PageContainer";

type SectionProps = Readonly<{
  children: ReactNode;
}>;

/** Creates a semantic page section with centrally managed major spacing. */
export function Section({ children }: SectionProps) {
  return (
    <section className="py-12 sm:py-20">
      <PageContainer>{children}</PageContainer>
    </section>
  );
}
