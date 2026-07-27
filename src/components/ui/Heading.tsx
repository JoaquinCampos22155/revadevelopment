import type { ReactNode } from "react";

type HeadingLevel = 1 | 2 | 3;
type HeadingVariant = "clean" | "editorial" | "compact";

type HeadingProps = Readonly<{
  children: ReactNode;
  className?: string;
  level?: HeadingLevel;
  variant?: HeadingVariant;
}>;

const variantClasses: Record<HeadingVariant, string> = {
  clean: "font-sans font-semibold tracking-tight",
  editorial: "font-serif font-medium tracking-tight",
  compact: "font-sans font-semibold uppercase tracking-[0.12em]",
};

const levelClasses: Record<HeadingLevel, string> = {
  1: "text-4xl leading-tight sm:text-5xl",
  2: "text-3xl leading-tight sm:text-4xl",
  3: "text-2xl leading-snug",
};

const headingTags = {
  1: "h1",
  2: "h2",
  3: "h3",
} as const;

/** Renders a semantic heading with an exploratory visual treatment. */
export function Heading({
  children,
  className,
  level = 2,
  variant = "clean",
}: HeadingProps) {
  const Tag = headingTags[level];
  const classes = [variantClasses[variant], levelClasses[level], className]
    .filter(Boolean)
    .join(" ");

  return <Tag className={classes}>{children}</Tag>;
}
