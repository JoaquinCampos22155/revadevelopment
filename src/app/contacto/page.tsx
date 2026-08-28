import type { Metadata } from "next";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = { title: "Contacto | REVA", description: "Encuentra el camino adecuado para conectar con REVA.", alternates: { canonical: "/contacto" }, robots: { follow: true, index: false } };

/** Keeps general contact secondary until REVA configures an official public channel. */
export default function ContactPage() { return <main id="main-content"><Section><div className="mx-auto max-w-2xl space-y-5 text-center"><Text variant="label">Contacto REVA</Text><Heading level={1} variant="editorial">Estamos preparando nuestros canales de contacto.</Heading><Text variant="body">Mientras tanto, puedes explorar prendas o conocer las rutas disponibles para vender o donar.</Text><div className="flex flex-wrap justify-center gap-3"><Button href="/catalogo" variant="solid">Explorar catálogo</Button><Button href="/vender" variant="outline">Vender</Button><Button href="/donar" variant="outline">Donar</Button></div></div></Section></main>; }
