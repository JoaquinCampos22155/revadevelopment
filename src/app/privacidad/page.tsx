import type { Metadata } from "next";

import { Section } from "@/components/layout/Section";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = {
  title: "Privacidad | REVA",
  description: "Conoce cómo REVA trata la información en su experiencia actual.",
  alternates: { canonical: "/privacidad" },
};

const sections = [
  {
    title: "Qué información tratamos hoy",
    content: "Si creas una cuenta, Supabase Auth gestiona tu identidad, correo electrónico, contraseña, sesiones, verificación y recuperación. REVA mantiene un perfil mínimo con un identificador y el nivel de acceso necesario para usar sus herramientas. También existe una preferencia de marketing reversible, aunque REVA no opera actualmente un sistema de campañas de marketing.",
  },
  {
    title: "Para qué la usamos",
    content: "Usamos la información de cuenta para permitir el inicio de sesión, proteger sesiones, administrar el acceso autorizado y operar las herramientas internas de REVA. Si una persona registrada entrega prendas a REVA, un registro operativo puede vincularse con su perfil para dar trazabilidad a ese proceso.",
  },
  {
    title: "Prendas, productos y fotografías",
    content: "Los registros operativos de prendas recibidas, como la procedencia interna y la gestión de ingreso, son privados. Cuando REVA publica un Producto, los datos necesarios para mostrar esa pieza y sus fotografías de entrega se vuelven visibles en el Catálogo y la página del Producto. Las fotos editoriales no representan necesariamente inventario disponible.",
  },
  {
    title: "Proveedores e infraestructura",
    content: "REVA utiliza Supabase para autenticación, sesiones y datos operativos, y Render para alojar el sitio. Estos proveedores pueden procesar la información técnica necesaria para prestar sus servicios, incluidos registros operativos o de ejecución conforme a su propia configuración y políticas.",
  },
  {
    title: "Pagos, analítica y cookies",
    content: "El sitio no tiene actualmente checkout, pagos nativos, carrito persistente, chatbot ni perfiles de analítica. REVA no usa en este momento cookies de publicidad ni rastreadores no esenciales dentro del sitio. La sesión de una cuenta utiliza datos técnicos esenciales para mantener el acceso autenticado.",
  },
  {
    title: "WhatsApp e Instagram",
    content: "Al elegir un enlace hacia WhatsApp o Instagram, sales de REVA y aplican las prácticas de privacidad de esa plataforma. REVA no controla cómo esos proveedores tratan la información que les compartes directamente.",
  },
  {
    title: "Seguridad",
    content: "REVA aplica controles técnicos y de acceso proporcionales a su operación actual para proteger la información. Ningún sistema elimina completamente el riesgo, por lo que evitamos presentar la seguridad como una garantía absoluta.",
  },
  {
    title: "Conservación, eliminación y solicitudes",
    content: "REVA aún no ofrece eliminación automática de cuentas ni ha publicado plazos específicos de conservación. No eliminamos de forma indiscriminada los registros operativos vinculados a prendas, porque ello puede afectar la trazabilidad, las responsabilidades internas y futuras decisiones de comercio. El proceso y canal específico para solicitudes de privacidad, eliminación o anonimización siguen pendientes de definición; esta página se actualizará antes de ampliar la funcionalidad de cuenta o el uso de datos.",
  },
  {
    title: "Cambios futuros",
    content: "Si REVA incorpora carrito, pagos, pedidos, chatbot, analítica u otras funciones que cambien los datos tratados, actualizará este aviso antes de usar esas nuevas categorías de información.",
  },
] as const;

/** Documents only REVA's current data surface and deliberately unresolved boundaries. */
export default function PrivacyPage() {
  return (
    <main id="main-content">
      <Section>
        <div className="mx-auto max-w-3xl space-y-10">
          <div className="space-y-4">
            <Text variant="label">Privacidad en REVA</Text>
            <Heading level={1} variant="editorial">Información clara sobre la experiencia actual.</Heading>
            <Text className="max-w-2xl" variant="body">Este aviso describe cómo REVA trata la información dentro del sitio hoy. No sustituye futuras políticas comerciales, de pagos, envíos o devoluciones que todavía no existen.</Text>
          </div>

          <div className="space-y-8">
            {sections.map((section) => (
              <section className="border-t border-reva-border pt-6" key={section.title}>
                <Heading level={2} variant="clean">{section.title}</Heading>
                <Text className="mt-3 text-reva-secondary" variant="body">{section.content}</Text>
              </section>
            ))}
          </div>
        </div>
      </Section>
    </main>
  );
}
