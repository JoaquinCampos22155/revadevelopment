import type { ReactNode } from "react";

type PageContainerProps = Readonly<{
  children: ReactNode;
}>;

/** Constrains shared page content to REVA's responsive reading width. */
export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
