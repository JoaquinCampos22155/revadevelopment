import type { ReactNode } from "react";

import { PageContainer } from "@/components/layout/PageContainer";

type SectionProps = Readonly<{
  children: ReactNode;
}>;

export function Section({ children }: SectionProps) {
  return (
    <section className="py-12 sm:py-16">
      <PageContainer>{children}</PageContainer>
    </section>
  );
}
