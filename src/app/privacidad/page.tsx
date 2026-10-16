import type { Metadata } from "next";
import Link from "next/link";

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
    content: "REVA utiliza Supabase para autenticación, sesiones y datos operativos, y Render para alojar el sitio. Estos proveedores pueden procesar la información técnica necesaria para prestar sus servicios, incluidos registros operativos o de ejecución conforme a su propia configuración y políticas.",
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
    content: "Puedes iniciar una consulta sobre tu información escribiendo al correo público de REVA. El procedimiento, verificación de identidad, alcance y plazo de atención aún no están definidos; no prometemos una eliminación automática ni un tiempo de respuesta.",
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
    content: "REVA aún no ofrece eliminación automática de cuentas ni ha publicado plazos específicos de conservación. No eliminamos de forma indiscriminada los registros operativos vinculados a prendas, porque ello puede afectar la trazabilidad, las responsabilidades internas y futuras decisiones de comercio. El proceso y canal específico para solicitudes de privacidad, eliminación o anonimización siguen pendientes de definición; esta página se actualizará antes de ampliar la funcionalidad de cuenta o el uso de datos.",
  },
  {
    id: "cambios",
    title: "Tratamientos futuros, aún no activos",
    navLabel: "Tratamientos futuros",
    content: "El Checkout actual no envía ni guarda los datos personales que escribas en sus campos. Si REVA habilita solicitudes de compra y órdenes, podría necesitar tratar por separado nombre y apellido, teléfono, municipio/zona y dirección de entrega; datos de facturación solo si se confirma que son necesarios; referencias de pago y datos mínimos para atender y auditar la operación. Una dirección guardada opcionalmente sería una función futura aparte y requeriría aprobación. Ninguna de estas funciones transaccionales está activa. Antes de comenzar a recopilar esos datos, REVA deberá actualizar este aviso para especificar su finalidad, destinatarios, uso limitado de proveedores y conservación. El diseño previsto contempla validación en servidor, acceso restringido bajo mínimo privilegio, controles de base de datos, cifrado apropiado de los datos sensibles con llaves fuera de la base de datos y acceso administrativo limitado y auditable; estas protecciones futuras no se presentan como ya implementadas. REVA no almacenará datos de tarjetas. Las solicitudes temporales futuras no reservarían prendas y vencerían individualmente 24 horas después de su registro en el servidor; los datos asociados se eliminarían conforme al procedimiento que se apruebe. Los registros de operaciones confirmadas se conservarían solo por el tiempo justificado para fines operativos o legales. Cualquier análisis geográfico futuro debería usar resultados agregados y no divulgar direcciones individuales. El consentimiento opcional de mercadeo se mantendrá separado del procesamiento necesario para una operación.",
  },
] as const;

const sectionColumns = [sections.slice(0, 6), sections.slice(6)] as const;

/** Documents only REVA's current data surface and deliberately unresolved boundaries. */
export default function PrivacyPage() {
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
          <p className="max-w-[75ch] text-sm leading-6 text-reva-secondary">
            Correo público para iniciar una consulta de privacidad: <a className="font-medium text-reva-primary underline decoration-reva-border underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="mailto:cam22155@uvg.edu.gt">cam22155@uvg.edu.gt</a>. El flujo y los tiempos de gestión todavía requieren definición.
          </p>
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
