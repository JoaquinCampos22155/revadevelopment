export const primaryNavigation = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/vender", label: "Vender" },
  { href: "/donar", label: "Donar" },
] as const;

export const loginNavigation = {
  href: "/iniciar-sesion",
  label: "Iniciar Sesión",
} as const;

export const footerNavigation = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/vender", label: "Vender" },
  { href: "/donar", label: "Donar" },
  { href: "/contacto", label: "Contacto" },
  { href: "/privacidad", label: "Privacidad" },
] as const;
