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
  solid: "bg-cyan-700 text-white hover:bg-cyan-800",
  outline:
    "border border-cyan-200 bg-white text-slate-950 hover:border-cyan-700 hover:bg-cyan-50",
};

function getButtonClasses(variant: ButtonVariant, className?: string) {
  return [
    "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-medium transition-[transform,box-shadow,background-color,border-color,color] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
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
