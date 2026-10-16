import { Button } from "@/components/ui/Button";
import {
  getInstagramProfileUrl,
  getWhatsAppProductInterestUrl,
  type PublicProductContact,
} from "@/infrastructure/config/site-contact";

type ProductContactCtaProps = Readonly<{ product: PublicProductContact }>;

/** Renders only configured public channels for a published Product inquiry. */
export function ProductContactCta({ product }: ProductContactCtaProps) {
  const whatsappUrl = getWhatsAppProductInterestUrl(product);
  const instagramUrl = getInstagramProfileUrl();
  const primaryChannel = whatsappUrl ? "whatsapp" : instagramUrl ? "instagram" : null;

  return (
    <aside className="reva-pdp-inquiry space-y-3">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-reva-secondary">
        ¿Tienes alguna duda?
      </p>
      <h2 className="font-serif text-xl font-medium leading-tight tracking-tight text-reva-primary sm:text-2xl">
        Consulta sobre esta prenda
      </h2>
      <p className="text-sm leading-6 text-reva-secondary">
        {primaryChannel === "whatsapp"
          ? "Agregar al carrito no reserva la prenda."
          : primaryChannel === "instagram"
            ? "Encuéntranos en Instagram para consultar sobre esta prenda."
            : "Los canales de consulta estarán disponibles próximamente."}
      </p>
      {whatsappUrl || instagramUrl ? <div className="flex flex-wrap gap-3">
        {whatsappUrl ? <Button href={whatsappUrl} rel="noreferrer" target="_blank" variant="outline">
          Consultar por WhatsApp
        </Button> : null}
        {instagramUrl ? <a className="inline-flex min-h-11 items-center px-2 text-xs text-reva-secondary underline underline-offset-4 transition-colors hover:text-reva-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-2" href={instagramUrl} rel="noreferrer" target="_blank">
          Consultar por Instagram
        </a> : null}
      </div> : null}
    </aside>
  );
}
