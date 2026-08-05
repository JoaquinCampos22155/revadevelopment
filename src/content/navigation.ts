export const primaryNavigation = [
  { href: "/", label: "Inicio" },
  { href: "/catalog", label: "Catálogo" },
  { href: "/about", label: "Nosotros" },
  { href: "/contact", label: "Contacto" },
] as const;

export const loginNavigation = {
  href: "/login",
  label: "Ingresar",
} as const;

export const footerNavigation = [
  { href: "/catalog", label: "Catálogo" },
  { href: "/about", label: "Sobre REVA" },
  { href: "/contact", label: "Contacto" },
] as const;

export const footerLegal = ["Política de privacidad", "Términos y condiciones"] as const;
