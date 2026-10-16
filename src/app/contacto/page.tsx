import type { Metadata } from "next";
import Image from "next/image";

import contactCommunityImage from "@/assets/editorial/reva-contact-community-editorial.webp";
import { Section } from "@/components/layout/Section";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { ContactExperience } from "@/features/contact/components/ContactExperience";
import {
  getInstagramContact,
  getWhatsAppGeneralContactUrl,
  REVA_PUBLIC_CONTACT_EMAIL,
} from "@/infrastructure/config/site-contact";

export const metadata: Metadata = {
  title: "Contacto | REVA",
  description: "Elige cómo quieres conectar con REVA: comprar, vender, donar o hacer una consulta general.",
  alternates: { canonical: "/contacto" },
  robots: { follow: true, index: false },
};

/** Resolves approved public contact destinations on the server before rendering the interactive route. */
export default function ContactPage() {
  const channels = {
    email: REVA_PUBLIC_CONTACT_EMAIL,
    instagram: getInstagramContact(),
    whatsappUrl: getWhatsAppGeneralContactUrl(),
  };

  return (
    <main className="reva-route-transition" id="main-content">
      <Section className="overflow-hidden">
        <div className="relative mx-auto max-w-6xl">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-reva-muted/70 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-12">
            <div className="reva-motion-enter max-w-2xl">
              <Text className="text-reva-secondary" variant="label">Contacto REVA</Text>
              <Heading className="mt-4" level={1} variant="editorial">¿En qué podemos ayudarte?</Heading>
              <Text className="mt-4 max-w-xl text-reva-secondary" variant="body">
                Elige el tema que tienes en mente y encuentra el siguiente paso para conversar con nosotros.
              </Text>
            </div>
            <figure className="reva-scroll-image group relative aspect-[3/2] overflow-hidden rounded-[2rem] bg-reva-muted shadow-[0_24px_80px_-56px_rgba(32,53,61,0.7)]">
              <Image
                alt="Tres personas conversan alrededor de una mesa con prendas de segunda mano en un espacio luminoso."
                className="object-cover object-[58%_center] transition-transform duration-700 ease-out group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                fill
                fetchPriority="high"
                sizes="(max-width: 1023px) calc(100vw - 3rem), 48vw"
                src={contactCommunityImage}
              />
            </figure>
          </div>
          <ContactExperience channels={channels} />
        </div>
      </Section>
    </main>
  );
}
