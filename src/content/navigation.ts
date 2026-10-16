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
  { href: "/contacto", label: "Contacto" },
  { href: "/terminos", label: "Términos y condiciones" },
  { href: "/privacidad", label: "Política de privacidad" },
  { href: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
] as const;
