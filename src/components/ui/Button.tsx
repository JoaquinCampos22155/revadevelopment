import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type ButtonVariant = "solid" | "outline";

type ButtonLinkProps = Readonly<
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: ReactNode;
    href: string;
    variant?: ButtonVariant;
  }
>;

type ButtonActionProps = Readonly<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    href?: never;
    variant?: ButtonVariant;
  }
>;

type ButtonProps = ButtonActionProps | ButtonLinkProps;

const variantClasses: Record<ButtonVariant, string> = {
  solid: "bg-reva-action text-reva-on-action hover:bg-reva-action-hover",
  outline:
    "border border-reva-border bg-reva-surface text-reva-primary hover:border-reva-brand-strong hover:bg-reva-muted",
};

function getButtonClasses(variant: ButtonVariant, className?: string) {
  return [
    "inline-flex min-h-11 items-center justify-center rounded-lg px-5 text-sm font-medium transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-2 focus-visible:ring-offset-reva-background disabled:cursor-not-allowed disabled:bg-reva-disabled disabled:text-reva-on-action disabled:hover:translate-y-0 disabled:hover:shadow-none",
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Renders a reusable action button or a navigational CTA link. */
export function Button(props: ButtonProps) {
  if ("href" in props) {
    const { children, className, href, variant = "outline", ...linkProps } =
      props as ButtonLinkProps;

    return (
      <Link className={getButtonClasses(variant, className)} href={href} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { children, className, type = "button", variant = "outline", ...buttonProps } =
    props as ButtonActionProps;

  return (
    <button
      className={getButtonClasses(variant, className)}
      type={type}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
