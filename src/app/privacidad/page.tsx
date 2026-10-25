import type { Metadata } from "next";
import Link from "next/link";

import { Section } from "@/components/layout/Section";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { getWhatsAppGeneralContactUrl, REVA_PUBLIC_CONTACT_EMAIL } from "@/infrastructure/config/site-contact";

export const metadata: Metadata = {
  title: "Privacidad | REVA",
  description: "Conoce cómo REVA trata la información en su experiencia actual.",
  alternates: { canonical: "/privacidad" },
};

const sections = [
  {
    id: "informacion",
    title: "Qué información tratamos hoy",
    navLabel: "Información actual",
    content: "Si creas una cuenta, Supabase Auth gestiona tu identidad, correo electrónico, contraseña, sesiones, verificación y recuperación. REVA mantiene un perfil mínimo con un identificador y el nivel de acceso necesario para usar sus herramientas. También existe una preferencia de marketing reversible, aunque REVA no opera actualmente un sistema de campañas de marketing.",
  },
  {
    id: "usos",
    title: "Para qué la usamos",
    navLabel: "Usos",
    content: "Usamos la información de cuenta para permitir el inicio de sesión, proteger sesiones, administrar el acceso autorizado y operar las herramientas internas de REVA. Si una persona registrada entrega prendas a REVA, un registro operativo puede vincularse con su perfil para dar trazabilidad a ese proceso.",
  },
  {
    id: "prendas",
    title: "Prendas, productos y fotografías",
    navLabel: "Prendas y fotografías",
    content: "Los registros operativos de prendas recibidas, como la procedencia interna y la gestión de ingreso, son privados. Cuando REVA publica un Producto, los datos necesarios para mostrar esa pieza y sus fotografías de entrega se vuelven visibles en el Catálogo y la página del Producto. Las fotos editoriales no representan necesariamente inventario disponible.",
  },
  {
    id: "seleccion",
    title: "Tu selección de prendas",
    navLabel: "Tu selección",
    content: "Si agregas prendas al carrito, REVA guarda en el almacenamiento local de ese navegador una lista de hasta 20 identificadores públicos de Producto (slugs). No guarda allí nombres, correos, cuentas, precios ni fotografías. Al abrir el carrito o revisar la selección, esos identificadores se consultan contra los Productos publicados para mostrar sus datos actuales; no se crea un registro de carrito en el servidor ni se vincula la selección con una cuenta. La lista permanece en ese navegador hasta retirar las prendas, vaciar el carrito o restablecer el almacenamiento del navegador. El carrito no aparta prendas ni es una orden o pago.",
  },
  {
    id: "proveedores",
    title: "Proveedores e infraestructura",
    navLabel: "Proveedores",
    content: "REVA no vende información personal ni la comparte con terceros para que la utilicen en su propio mercadeo. Proveedores necesarios para operar el sitio o atender una gestión —por ejemplo, alojamiento, autenticación, infraestructura de datos o mensajería cuando la persona elige ese canal— pueden tratar la información mínima necesaria para el servicio, con salvaguardas apropiadas y según se informe para cada uso. Supabase presta autenticación, sesiones y servicios de datos; Render aloja el sitio. Si contactas a REVA por WhatsApp o Instagram, también aplican las prácticas de privacidad de esa plataforma.",
  },
  {
    id: "pagos",
    title: "Pagos, analítica y cookies",
    navLabel: "Pagos y cookies",
    content: "REVA ofrece un Checkout no transaccional para revisar prendas y abrir una consulta de compra por WhatsApp. Los campos de contacto, entrega y facturación que escribas allí se mantienen solo en memoria del navegador para la vista de revisión: no se envían a REVA ni se guardan. Para verificar la selección, el servidor recibe slugs públicos y el precio público que se mostró en pantalla; vuelve a consultar los Productos y usa su precio vigente. El enlace preparado para WhatsApp contiene títulos, precios públicos, subtotal y enlaces canónicos, no tu dirección, teléfono, correo o NIT. Si compartes información directamente en WhatsApp, aplican las prácticas de esa plataforma. No hay órdenes, reservas, pagos integrados, facturación electrónica ni perfiles de analítica. El carrito conserva únicamente slugs en el almacenamiento local del navegador; no utiliza una cookie para esa selección. REVA no usa en este momento cookies de publicidad ni rastreadores no esenciales; la sesión de una cuenta utiliza datos técnicos esenciales para mantener el acceso autenticado.",
  },
  {
    id: "canales",
    title: "WhatsApp e Instagram",
    navLabel: "Canales externos",
    content: "Al elegir un enlace hacia WhatsApp o Instagram, sales de REVA y aplican las prácticas de privacidad de esa plataforma. REVA no controla cómo esos proveedores tratan la información que les compartes directamente.",
  },
  {
    id: "solicitudes",
    title: "Solicitudes de privacidad",
    navLabel: "Solicitudes",
    content: "Puedes enviar consultas de privacidad o solicitudes de acceso, corrección o eliminación al correo público de REVA o por su canal oficial de WhatsApp. Antes de revelar información o modificarla, REVA verificará razonablemente la identidad y autoridad de quien lo solicita. La eliminación puede estar sujeta a obligaciones comerciales o fiscales aplicables; enviar una solicitud no implica eliminación automática. No se promete un plazo de respuesta.",
  },
  {
    id: "seguridad",
    title: "Seguridad",
    navLabel: "Seguridad",
    content: "REVA aplica controles técnicos y de acceso proporcionales a su operación actual para proteger la información. Ningún sistema elimina completamente el riesgo, por lo que evitamos presentar la seguridad como una garantía absoluta.",
  },
  {
    id: "conservacion",
    title: "Conservación, eliminación y solicitudes",
    navLabel: "Conservación",
    content: "REVA conserva información solo durante el tiempo justificado por los fines descritos y las obligaciones aplicables; no promete retención indefinida ni establece un plazo único para todos los datos. Los registros comerciales o fiscales que deban conservarse por ley se preservarán durante el período que corresponda. Actualmente no existe eliminación automática de cuentas desde el sitio. Las solicitudes de privacidad se reciben por los canales indicados arriba; cualquier divulgación o cambio requiere una verificación razonable de identidad y la revisión de obligaciones aplicables.",
  },
  {
    id: "cambios",
    title: "Tratamientos futuros, aún no activos",
    navLabel: "Tratamientos futuros",
    content: "El Checkout actual no envía ni guarda los datos personales que escribas en sus campos. En una etapa futura, una solicitud temporal de compra expirará individualmente 24 horas después de su creación en el servidor, no reservará prendas y no se extenderá automáticamente. Las solicitudes expiradas o descartadas y sus datos asociados se eliminarán de los sistemas operativos; no se conservarán métricas de mercadeo derivadas de ellas. Los ciclos técnicos de recuperación y eliminación de copias de respaldo se documentarán antes de activar este tratamiento. Si REVA habilita órdenes, podría tratar por separado nombre y apellido, teléfono, municipio/zona y dirección de entrega, datos de facturación que se confirmen necesarios, y referencias operativas de pago. Estos usos futuros podrán apoyar la gestión de compra, entrega, facturación, atención al cliente y operaciones legítimas posteriores; no están activos hoy. Antes de habilitarlos, REVA actualizará este aviso con los fines, destinatarios, proveedores necesarios y conservación aplicables. El diseño previsto contempla validación en servidor, acceso restringido bajo mínimo privilegio, controles de base de datos, cifrado apropiado con llaves separadas de la base de datos y acceso administrativo limitado y auditable; estas protecciones futuras no se presentan como ya implementadas. REVA no almacenará datos de tarjetas. Los registros de órdenes se conservarán solo durante el tiempo justificado; los documentos comerciales o fiscales exigidos por ley podrán mantenerse durante el período aplicable. Cualquier análisis geográfico futuro usará resultados agregados, no direcciones individuales. La autorización para mercadeo será opcional y separada de la compra.",
  },
] as const;

const sectionColumns = [sections.slice(0, 6), sections.slice(6)] as const;

/** Documents only REVA's current data surface and deliberately unresolved boundaries. */
export default function PrivacyPage() {
  const whatsappPrivacyUrl = getWhatsAppGeneralContactUrl();

  return (
    <main className="reva-route-transition" id="main-content">
      <Section className="border-b border-reva-border bg-reva-muted">
        <div className="grid gap-8 border-l-2 border-reva-brand pl-5 sm:gap-12 sm:pl-9 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.72fr)] lg:items-end lg:gap-20">
          <div>
            <Text className="text-reva-brand-strong" variant="label">Privacidad en REVA · {sections.length} temas</Text>
            <Heading className="mt-5 max-w-4xl text-reva-primary" level={1} variant="editorial">Información clara sobre la experiencia actual.</Heading>
          </div>
          <Text className="max-w-[62ch] border-t border-reva-border pt-4 text-reva-secondary" variant="body">Este aviso describe el tratamiento actual. El Checkout disponible solo revisa la selección y abre una consulta; no crea pedidos, pagos ni facturas, y no transmite los datos personales introducidos en sus campos de revisión.</Text>
        </div>
      </Section>

      <Section className="py-10 sm:py-14">
        <nav aria-label="Temas del aviso de privacidad" className="mb-10 border-b border-reva-border pb-6 sm:mb-14">
          <ul className="flex flex-wrap gap-2">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a className="inline-flex min-h-11 items-center gap-2 rounded-full border border-reva-border bg-reva-background px-4 py-2 text-sm text-reva-primary transition-[color,border-color,background-color,translate] duration-200 hover:-translate-y-0.5 hover:border-reva-brand-strong hover:bg-reva-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0" href={`#${section.id}`}>
                  <span aria-hidden="true" className="font-mono text-[0.65rem] text-reva-brand-strong">{String(index + 1).padStart(2, "0")}</span>
                  {section.navLabel}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid gap-x-12 gap-y-12 lg:grid-cols-2 xl:gap-x-20">
          {sectionColumns.map((column, columnIndex) => (
            <div className="space-y-10 sm:space-y-12" key={columnIndex}>
              {column.map((section) => (
                <section className="privacy-section scroll-mt-28 border-t border-reva-border pt-5 sm:pt-6" id={section.id} key={section.id}>
                  <div className="flex items-start gap-4">
                    <span aria-hidden="true" className="pt-1 font-mono text-xs text-reva-brand-strong">{String(sections.indexOf(section) + 1).padStart(2, "0")}</span>
                    <Heading className="text-reva-primary" level={2} variant="clean">{section.title}</Heading>
                  </div>
                  <p className="mt-3 text-left leading-7 text-reva-secondary hyphens-auto lg:text-justify" lang="es">{section.content}</p>
                </section>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-5 border-t border-reva-border pt-5 sm:mt-16">
          <div className="max-w-[75ch] text-sm leading-6 text-reva-secondary">
            <p>Canales para consultas o solicitudes de privacidad:</p>
            <a className="mr-5 inline-flex min-h-11 items-center font-medium text-reva-primary underline decoration-reva-border underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href={`mailto:${REVA_PUBLIC_CONTACT_EMAIL}`}>{REVA_PUBLIC_CONTACT_EMAIL}</a>
            {whatsappPrivacyUrl ? <a className="inline-flex min-h-11 items-center font-medium text-reva-primary underline decoration-reva-border underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href={whatsappPrivacyUrl} rel="noreferrer" target="_blank">WhatsApp de REVA<span className="sr-only"> (abre en una pestaña nueva)</span></a> : null}
          </div>
          <Link className="inline-flex min-h-11 items-center text-sm font-medium text-reva-brand-strong underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="/contacto">Ver canales de contacto</Link>
        </div>
        <nav aria-label="Información relacionada" className="mt-4 flex flex-wrap gap-x-7 gap-y-2 text-sm">
          <Link className="inline-flex min-h-11 items-center text-reva-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="/terminos">Leer los términos de REVA</Link>
          <Link className="inline-flex min-h-11 items-center text-reva-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="/preguntas-frecuentes">Consultar preguntas frecuentes</Link>
        </nav>
      </Section>
    </main>
  );
}
