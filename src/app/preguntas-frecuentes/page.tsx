import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/PageContainer";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = {
  title: "Preguntas frecuentes | REVA",
  description: "Respuestas claras sobre comprar, vender y donar ropa con REVA.",
  alternates: { canonical: "/preguntas-frecuentes" },
};

const groups = [
  { id: "general", title: "General", accent: "text-reva-brand-strong", questions: [
    ["¿Qué es REVA?", "REVA conecta la compra, venta y donación de ropa de segunda mano. Revisamos las prendas y gestionamos las que pueden continuar su circulación."],
    ["¿Dónde opera REVA?", "La cobertura operativa aprobada actualmente es Ciudad de Guatemala."],
    ["¿Necesito una cuenta para explorar?", "No. Puedes ver el catálogo público sin registrarte."],
  ] },
  { id: "comprar", title: "Comprar", accent: "text-reva-brand-strong", questions: [
    ["¿Las prendas del catálogo son únicas?", "Sí. Cada publicación corresponde a una prenda física individual. Su disponibilidad puede cambiar."],
    ["¿Agregar al carrito aparta una prenda?", "No. El carrito guarda una selección en tu navegador y no reserva inventario. La disponibilidad y el precio se vuelven a revisar antes de continuar la consulta."],
    ["¿Cómo compro actualmente?", "El Checkout te permite revisar una o varias prendas y completar datos de contacto, entrega y facturación para revisar el resumen. Por ahora, esos datos solo permanecen en la memoria del navegador: REVA no los recibe ni almacena. Al continuar, se vuelve a verificar la disponibilidad y el precio y se abre WhatsApp para coordinar la consulta. El sitio todavía no crea pedidos persistentes ni integra pagos, enlaces de pago o facturación electrónica."],
    ["¿Cuánto cuesta el envío?", "La cobertura inicial es Ciudad de Guatemala y el costo se confirma antes de completar la compra. No hay una tarifa universal ni una regla de envío gratis aprobada para publicar."],
    ["¿Puedo cancelar o cambiar la dirección de entrega?", "Puedes cancelar antes de que REVA confirme el despacho y solicitar un cambio de dirección antes del despacho, sujeto a cobertura y posibles ajustes de costo. Si recibes una prenda equivocada o con un defecto importante no informado, contacta a REVA para que revise el caso. Las fotos o video de apertura pueden ayudar, pero no son una condición absoluta ni limitan derechos aplicables. No hay devoluciones generales por cambio de opinión; si una devolución se acepta, REVA define según el caso si recoge la prenda o cubre el envío de regreso. Los créditos internos son la solución comercial habitual, pero otras soluciones pueden aplicar según el caso y los derechos que correspondan."],
  ] },
  { id: "vender", title: "Vender", accent: "text-[#705b78]", questions: [
    ["¿Cuántas prendas necesito?", "Un lote de al menos 15 prendas. REVA debe revisar físicamente cada pieza y solo algunas pueden ser elegibles para reventa."],
    ["¿Quién define el precio?", "REVA valora las prendas elegibles considerando sus características y comparte un estimado antes de publicar. No existe una fórmula pública fija."],
    ["¿Cómo se distribuye el precio de venta?", "Por cada prenda vendida, corresponde 65% del precio al propietario y 35% a REVA. Además, se cobra Q5 por cada lote recibido, junto con el costo de envío de recepción, informado antes de coordinarlo. La tarifa cubre recepción, revisión, fotografía y publicación; no se devuelve por el trabajo ya realizado, sin perjuicio de los derechos aplicables."],
    ["¿Cuándo se paga al propietario?", "La parte correspondiente al propietario se asigna después de cada venta. El mecanismo y las condiciones de pago se informan antes de aceptar el lote."],
    ["¿Qué ocurre al terminar el período?", "REVA intenta vender las prendas elegibles durante hasta 90 días desde que recibe físicamente el lote. Al finalizar, puedes donar las prendas no vendidas, pedir su devolución pagando el envío o acordar una extensión. Si no respondes, se contempla una notificación y un plazo adicional de 10 días; disponer de prendas no reclamadas requiere tu autorización expresa previa."],
    ["¿Puedo retirar prendas antes?", "Sí. El retiro anticipado tiene un cargo de Q10 por cada prenda retirada, además del envío de regreso. Las prendas ya vendidas no pueden recuperarse. Las condiciones concretas se confirman antes de aceptar el lote."],
  ] },
  { id: "donar", title: "Donar y Drops", accent: "text-[#78434b]", questions: [
    ["¿Puedo donar sin vender primero?", "Sí. Donar es una ruta distinta desde el inicio; reúne al menos 15 prendas y coordina su recepción con REVA."],
    ["¿Qué sucede con las prendas donadas?", "REVA las revisa y clasifica. Según su condición y la capacidad disponible, algunas pueden destinarse a venta para continuar circulando y otras a donación directa u otra alternativa posible. No se garantiza una persona u organización destinataria específica."],
    ["¿Qué es un Drop?", "Un Drop es un espacio temporal de recolección cuando REVA lo anuncia. No hay calendario o ubicación permanente; revisa los canales oficiales para conocer convocatorias vigentes."],
    ["¿Qué prendas recibe REVA?", "La revisión es física. La ropa interior usada no se acepta; zapatos y accesorios están fuera del alcance actual. Recibir un lote no garantiza que cada prenda sea elegible para reventa."],
    ["¿REVA tiene un programa de reciclaje textil?", "No se anuncia un programa o socio de reciclaje activo. REVA aún trabaja por definir alternativas para prendas que no pueden seguir por venta o donación."],
  ] },
  { id: "cuenta", title: "Cuenta, créditos y privacidad", accent: "text-reva-brand-strong", questions: [
    ["¿Cómo creo una cuenta?", "El registro disponible utiliza correo electrónico y contraseña. Algunas funciones de perfil todavía no están implementadas."],
    ["¿Cómo puedo hacer una solicitud de privacidad?", "Puedes consultar, solicitar acceso, corrección o eliminación de información por el correo público cam22155@uvg.edu.gt o por el WhatsApp oficial de REVA. Antes de revelar o modificar información, REVA verificará razonablemente tu identidad y autoridad. El correo es provisional y cambiará cuando REVA establezca un dominio propio. No hay eliminación automática de cuentas ni un plazo de respuesta prometido; pueden conservarse los registros que deban mantenerse por obligaciones aplicables."],
    ["¿Qué son los créditos REVA?", "No existe actualmente un saldo de créditos disponible para compras. No uses respuestas de documentos de planificación como una promesa de crédito activo."],
    ["¿Qué datos guarda el carrito?", "Solo una lista local de referencias públicas de prendas en ese navegador; no crea un registro de carrito en el servidor ni reserva las piezas. Consulta el Aviso de privacidad para más detalle."],
  ] },
] as const;

/** Scannable FAQ disclosures use native details/summary so they work without client JavaScript. */
export default function FrequentlyAskedQuestionsPage() {
  return (
    <main id="main-content" className="reva-route-transition bg-reva-background">
      <section className="bg-reva-muted py-14 sm:py-20">
        <PageContainer>
          <div className="max-w-3xl">
            <Text className="text-reva-brand-strong" variant="label">Centro de ayuda</Text>
            <Heading className="mt-4 text-reva-primary sm:text-6xl" level={1} variant="editorial">Preguntas claras. Decisiones con confianza.</Heading>
            <Text className="mt-5 max-w-2xl text-reva-secondary" variant="body">Encuentra respuestas sobre las rutas actuales de REVA. Las funciones que aún no existen se identifican como tales.</Text>
          </div>
          <nav aria-label="Categorías de preguntas" className="mt-8 flex flex-wrap gap-3">
            {groups.map((group) => <a className="inline-flex min-h-11 items-center border-b border-reva-border px-1 text-sm font-medium text-reva-primary hover:border-reva-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href={`#${group.id}`} key={group.id}>{group.title}</a>)}
          </nav>
        </PageContainer>
      </section>
      <section className="py-10 sm:py-16">
        <PageContainer>
          <div className="mx-auto max-w-4xl">
            {groups.map((group) => (
              <section className="py-6 sm:py-9" id={group.id} key={group.id}>
                <Heading className={`mb-5 ${group.accent}`} level={2} variant="editorial">{group.title}</Heading>
                <div className="divide-y divide-reva-border border-y border-reva-border">
                  {group.questions.map(([question, answer]) => <details className="group py-1" key={question}>
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-5 py-3 font-medium text-reva-primary marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-2">
                      {question}<span aria-hidden="true" className="reva-disclosure-icon shrink-0 font-serif text-2xl text-reva-brand-strong">+</span>
                    </summary>
                    <p className="max-w-3xl pb-5 pr-8 text-sm leading-6 text-reva-secondary sm:text-base sm:leading-7">{answer}</p>
                  </details>)}
                </div>
              </section>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-reva-border pt-5 text-sm">
            <a className="inline-flex min-h-11 items-center text-reva-brand-strong underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="/terminos">Leer los términos de REVA</a>
            <a className="inline-flex min-h-11 items-center text-reva-brand-strong underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus" href="/privacidad">Leer el aviso de privacidad</a>
          </div>
        </PageContainer>
      </section>
    </main>
  );
}
