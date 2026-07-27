import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "solid" | "outline" | "soft";

type ButtonProps = Readonly<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    variant?: ButtonVariant;
  }
>;

const variantClasses: Record<ButtonVariant, string> = {
  solid: "bg-neutral-950 text-white hover:bg-neutral-800",
  outline:
    "border border-neutral-300 bg-white text-neutral-950 hover:border-neutral-950",
  soft: "bg-neutral-100 text-neutral-950 hover:bg-neutral-200",
};

/** Renders a reusable action button with an exploratory visual treatment. */
export function Button({
  children,
  className,
  type = "button",
  variant = "solid",
  ...props
}: ButtonProps) {
  const classes = [
    "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-medium transition-colors",
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}
