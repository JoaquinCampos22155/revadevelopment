import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
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
    <aside className="space-y-3 rounded-xl bg-reva-brand-strong p-5 text-reva-on-action sm:p-6">
      <Text className="text-reva-on-action" variant="label">
        Compra con REVA
      </Text>
      <Heading className="text-2xl text-reva-on-action sm:text-3xl" level={2} variant="editorial">
        ¿Quieres comprar esta prenda?
      </Heading>
      <Text className="text-reva-on-action" variant="body">
        {primaryChannel === "whatsapp"
          ? "Escríbenos por WhatsApp para continuar con tu compra."
          : primaryChannel === "instagram"
            ? "Encuéntranos en Instagram para continuar con tu compra."
            : "Los canales de consulta estarán disponibles próximamente."}
      </Text>
      {whatsappUrl || instagramUrl ? <div className="flex flex-wrap gap-3">
        {whatsappUrl ? <Button className="bg-reva-surface text-reva-primary hover:bg-reva-muted" href={whatsappUrl} rel="noreferrer" target="_blank" variant="solid">
          Comprar por WhatsApp
        </Button> : null}
        {instagramUrl ? <Button className={whatsappUrl ? "border-reva-on-action/60 bg-transparent text-reva-on-action hover:border-reva-on-action hover:bg-reva-on-action/10" : "bg-reva-surface text-reva-primary hover:bg-reva-muted"} href={instagramUrl} rel="noreferrer" target="_blank" variant={whatsappUrl ? "outline" : "solid"}>
          <span className={whatsappUrl ? "text-reva-on-action" : undefined}>Consultar por Instagram</span>
        </Button> : null}
      </div> : null}
    </aside>
  );
}
