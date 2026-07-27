import type { ReactNode } from "react";

type TextVariant = "body" | "quiet" | "label";

type TextProps = Readonly<{
  children: ReactNode;
  className?: string;
  variant?: TextVariant;
}>;

const variantClasses: Record<TextVariant, string> = {
  body: "text-base leading-7",
  quiet: "text-sm leading-6 text-neutral-600",
  label: "text-xs font-medium uppercase tracking-[0.12em] text-neutral-600",
};

/** Renders a paragraph using one of the exploratory text treatments. */
export function Text({ children, className, variant = "body" }: TextProps) {
  const classes = [variantClasses[variant], className]
    .filter(Boolean)
    .join(" ");

  return <p className={classes}>{children}</p>;
}
