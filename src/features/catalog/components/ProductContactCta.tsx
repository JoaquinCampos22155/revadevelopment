import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { socialLinks } from "@/content/social";

/** Keeps the product conversion location stable while the official social channel is configured. */
export function ProductContactCta() {
  return (
    <aside className="space-y-4 rounded-3xl bg-slate-950 p-7 text-white">
      <Text className="text-sky-200" variant="label">
        Contacto REVA
      </Text>
      <Heading level={2} variant="editorial">
        ¿Esta prenda puede ser para ti?
      </Heading>
      <Text className="text-sky-100" variant="body">
        Nuestro canal oficial aparecerá aquí para que puedas resolver dudas y
        continuar tu compra con REVA.
      </Text>
      {socialLinks.instagram ? (
        <Button className="bg-white text-slate-950 hover:bg-sky-100" href={socialLinks.instagram} variant="solid">
          Contactar a REVA
        </Button>
      ) : null}
    </aside>
  );
}
