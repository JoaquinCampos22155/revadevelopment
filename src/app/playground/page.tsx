import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
export const metadata: Metadata = { title: "Design Playground | REVA", robots: { follow: false, index: false } };
/** Preserves the internal playground when no visual decision is currently open. */
export default function DesignPlayground() { return <main><Section><div className="space-y-4"><Text variant="label">REVA / Design Playground</Text><Heading level={1} variant="editorial">Las decisiones visuales actuales están definidas.</Heading><Text variant="quiet">Bruma Circular es la paleta de trabajo. Este espacio permanece disponible para futuras exploraciones que necesiten comparación real.</Text></div></Section></main>; }
