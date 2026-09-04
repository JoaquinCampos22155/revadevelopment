import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { socialLinks } from "@/content/social";

/** Keeps the product conversion location stable while the official social channel is configured. */
export function ProductContactCta() {
  return (
    <aside className="space-y-4 rounded-xl bg-reva-brand-strong p-7 text-reva-on-action">
      <Text className="text-reva-on-action" variant="label">
        Contacto REVA
      </Text>
      <Heading level={2} variant="editorial">
        ¿Esta prenda puede ser para ti?
      </Heading>
      <Text className="text-reva-on-action" variant="body">
        Nuestro canal oficial aparecerá aquí para que puedas resolver dudas y
        continuar tu compra con REVA.
      </Text>
      {socialLinks.instagram ? (
        <Button className="bg-reva-surface text-reva-primary hover:bg-reva-muted" href={socialLinks.instagram} variant="solid">
          Contactar a REVA
        </Button>
      ) : null}
    </aside>
  );
}
