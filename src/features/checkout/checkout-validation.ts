export type CheckoutDeliveryInput = Readonly<{
  firstName: string;
  lastName: string;
  phone: string;
  municipalityCode: string;
  street: string;
  houseNumber: string;
}>;

export type CheckoutDeliveryField = keyof CheckoutDeliveryInput;
export type CheckoutDeliveryErrors = Partial<Record<CheckoutDeliveryField, string>>;

const PHONE_ERROR = "Ingresa un teléfono válido de Guatemala (8 dígitos, con o sin +502).";

export function validateCheckoutDelivery(input: CheckoutDeliveryInput): CheckoutDeliveryErrors {
  const errors: CheckoutDeliveryErrors = {};

  if (!input.firstName.trim()) errors.firstName = "Ingresa tu nombre.";
  if (!input.lastName.trim()) errors.lastName = "Ingresa tu apellido.";

  const phoneText = input.phone.trim();
  const phoneDigits = phoneText.replace(/\D/g, "");
  const hasPhoneCharactersOnly = /^\+?[\d\s().-]+$/.test(phoneText);
  if (!hasPhoneCharactersOnly || (phoneDigits.length !== 8 && !(phoneDigits.length === 11 && phoneDigits.startsWith("502")))) {
    errors.phone = PHONE_ERROR;
  }

  if (!input.municipalityCode.trim()) errors.municipalityCode = "Selecciona un municipio.";
  if (!input.street.trim()) errors.street = "Ingresa la calle o avenida.";
  if (!input.houseNumber.trim()) errors.houseNumber = "Ingresa el número de casa o lote.";

  return errors;
}

export function formatCheckoutContactName(firstName: string, lastName: string): string {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
}
