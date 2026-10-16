import type { Metadata } from "next";
import Link from "next/link";

import { PageContainer } from "@/components/layout/PageContainer";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = {
  title: "Términos y condiciones | REVA",
  description: "Conoce el alcance actual de REVA para explorar, comprar, vender y donar prendas.",
  alternates: { canonical: "/terminos" },
};

const sections = [
  { id: "sitio", title: "1. Uso del sitio", body: "REVA presenta información y un catálogo de prendas de segunda mano. Puedes explorar el contenido público sin crear una cuenta. Usa el sitio de forma lícita y no intentes interferir con su disponibilidad o seguridad." },
  { id: "cuenta", title: "2. Cuentas", body: "Algunas herramientas administrativas requieren una cuenta. El registro público permite autenticación por correo electrónico y contraseña; la cuenta no habilita por sí sola funciones comerciales que todavía no están disponibles. Consulta el Aviso de privacidad para conocer el tratamiento actual de los datos." },
  { id: "comprar", title: "3. Catálogo y consultas de compra", body: "Cada publicación corresponde a una prenda física única. La ficha muestra su condición y fotografías de esa pieza. La disponibilidad puede cambiar. La selección local y el Checkout disponible permiten revisar una o varias prendas y abrir una consulta de compra por WhatsApp; no reservan inventario, crean una orden ni confirman una compra. La consulta incluye datos públicos de las prendas y pide confirmar disponibilidad y entrega. Precio vigente, disponibilidad, cobertura, entrega y cualquier costo aplicable deben confirmarse con REVA antes de aceptar la compra. El sitio no procesa pagos ni ofrece una reserva de tres horas." },
  { id: "vender", title: "4. Entrega para venta", body: "La ruta de venta comienza con un lote de al menos 15 prendas y requiere coordinación y revisión física. REVA selecciona las prendas elegibles, define su precio de publicación y comunica al propietario un estimado antes de publicar. Por cada prenda vendida, corresponde 65% del precio al propietario y 35% a REVA. Se cobra una tarifa fija de gestión de Q5 por cada lote recibido, junto con el costo de envío del lote a REVA; ese costo de envío se informa antes de coordinar la recepción. La tarifa de gestión cubre recepción, revisión, fotografía y publicación. No se devuelve por el trabajo ya realizado, sin perjuicio de los derechos que correspondan conforme a la ley. El período de venta es de hasta 90 días desde la recepción física del lote. La parte del propietario corresponde después de cada venta; el mecanismo y las condiciones de pago se informan antes de aceptar el lote. Si solicitas retirar prendas antes de terminar el período, aplica un cargo de Q10 por cada prenda retirada, además del envío de regreso; las prendas ya vendidas no pueden recuperarse. Al finalizar puedes elegir donar las prendas no vendidas, solicitar su devolución —pagando el envío— o acordar una extensión. Si no respondes, REVA contempla un plazo adicional de 10 días y una notificación; disponer de prendas no reclamadas requiere tu autorización expresa previa. Las condiciones concretas de recepción y cualquier autorización aplicable se confirman antes de aceptar el lote." },
  { id: "donar", title: "5. Donaciones y Drops", body: "Donar es una ruta distinta a la venta y requiere coordinación y revisión física. REVA clasifica las prendas conforme a su condición y capacidad operativa. Según el caso, prendas donadas pueden destinarse a donación directa, venta para continuar circulando o reutilización; por ello, donar a REVA no garantiza la entrega de cada prenda a una persona u organización específica. Al entregar prendas para donación, autorizas a REVA a gestionarlas conforme a esta finalidad y a las condiciones comunicadas antes de recibirlas. Los Drops son espacios temporales cuando se anuncian; no hay una fecha o ubicación permanente garantizada. REVA no afirma contar actualmente con un programa de reciclaje textil." },
  { id: "envios", title: "6. Entregas, cancelaciones y reclamos", body: "La cobertura operativa actual es Ciudad de Guatemala. La forma, costo y plazo de entrega se confirman caso por caso antes de completar una compra; no se ofrece una tarifa universal ni envío gratuito por umbral de prendas confirmado. La política de cancelaciones, cambios, devoluciones y soluciones a reclamos todavía requiere aprobación comercial y revisión jurídica. Si detectas una diferencia o incidencia, contacta a REVA por sus canales oficiales para que revise el caso; este texto no establece una renuncia a derechos ni una solución automática." },
  { id: "creditos", title: "7. Créditos, pagos y funciones futuras", body: "Los créditos REVA no están disponibles como saldo de compra en la experiencia actual. El Checkout es una revisión no transaccional que abre WhatsApp para coordinar la consulta. No hay órdenes, reservas automáticas, cobro integrado, verificación de pago ni facturación electrónica operativa. REVA puede comunicar instrucciones para continuar con el pago fuera del sitio, pero abrir WhatsApp no demuestra que el mensaje se haya enviado ni que exista una orden o un pago confirmado. Las opciones concretas de pago, facturación y entrega deben comunicarse antes de confirmar una operación." },
  { id: "contacto", title: "8. Contacto y privacidad", body: "Para consultas generales puedes usar los canales publicados en Contacto. El Aviso de privacidad describe los datos que REVA procesa hoy y cómo iniciar una solicitud; no se han definido plazos específicos de conservación ni un procedimiento automatizado de eliminación de cuentas." },
] as const;

/** Publishes only the current, bounded service description; this is not legal certification. */
export default function TermsPage() {
  return (
    <main id="main-content" className="reva-route-transition bg-reva-background">
      <section className="border-b border-reva-border bg-reva-muted py-14 sm:py-20">
        <PageContainer>
          <div className="grid gap-8 border-l-2 border-reva-brand-strong pl-5 sm:gap-12 sm:pl-9 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)] lg:items-end lg:gap-20">
            <div className="relative">
              <Text className="text-reva-brand-strong" variant="label">Documento de consulta · 08 apartados</Text>
              <Heading className="mt-5 max-w-4xl text-reva-primary sm:text-6xl" level={1} variant="editorial">Términos de uso de REVA.</Heading>
            </div>
            <div className="max-w-[58ch] border-t border-reva-border pt-4">
              <Text className="text-reva-secondary" variant="body">Este documento explica el alcance actual del sitio y sus recorridos. Las condiciones comerciales completas todavía requieren confirmación de REVA y revisión jurídica/fiscal en Guatemala; no representa una certificación legal.</Text>
            </div>
          </div>
        </PageContainer>
      </section>
      <section className="py-12 sm:py-16">
        <PageContainer>
          <div className="grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] xl:gap-20">
            <nav aria-label="Índice de términos" className="lg:sticky lg:top-28 lg:self-start">
              <Text className="mb-3 text-reva-secondary" variant="label">En esta página</Text>
              <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a className="group flex min-h-12 items-center gap-3 rounded-sm border border-transparent px-3 py-2 text-sm text-reva-primary transition-[color,border-color,background-color,translate] duration-200 hover:translate-x-1 hover:border-reva-border hover:bg-reva-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus motion-reduce:transition-none motion-reduce:hover:translate-x-0" href={`#${section.id}`}>
                      <span aria-hidden="true" className="font-mono text-xs text-reva-brand-strong">{String(index + 1).padStart(2, "0")}</span>
                      <span className="group-hover:underline group-hover:decoration-reva-brand-strong group-hover:underline-offset-4">{section.title.replace(/^\d+\. /, "")}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="min-w-0">
              <div className="divide-y divide-reva-border border-y border-reva-border">
                {sections.map((section) => (
                  <section className="terms-section grid scroll-mt-28 gap-3 py-8 sm:grid-cols-[minmax(11rem,0.38fr)_minmax(0,1fr)] sm:gap-10 sm:py-9" id={section.id} key={section.id}>
                    <Heading className="text-reva-primary" level={2} variant="clean">{section.title}</Heading>
                    <p className="max-w-[82ch] text-left leading-7 text-reva-secondary hyphens-auto lg:text-justify" lang="es">{section.body}</p>
                  </section>
                ))}
              </div>
              <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm">
                <Link className="inline-flex min-h-11 items-center text-reva-brand-strong underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="/privacidad">Leer el Aviso de privacidad</Link>
                <Link className="inline-flex min-h-11 items-center text-reva-brand-strong underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="/preguntas-frecuentes">Consultar preguntas frecuentes</Link>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    </main>
  );
}
