export const primaryNavigation = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
] as const;

export const loginNavigation = {
  href: "/iniciar-sesion",
  label: "Ingresar",
} as const;

export const footerNavigation = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/nosotros", label: "Sobre REVA" },
  { href: "/contacto", label: "Contacto" },
] as const;

export const footerLegal = ["Política de privacidad", "Términos y condiciones"] as const;
