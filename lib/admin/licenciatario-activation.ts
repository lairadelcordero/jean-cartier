import { isValidEmail, isValidPhone, isValidRutCuit } from "@/lib/admin/validation";

const PLACEHOLDER_RAZON = "pendiente de completar";
const PEND_EMAIL_SUFFIX = "@jc.local";

export type ActivationCheckResult = {
  ready: boolean;
  missing: string[];
};

export function evaluateLicenciatarioActivation(input: {
  razon_social: string;
  rut_cuit: string;
  tipo_entidad: string;
  primary_email: string;
  primary_phone: string;
  has_active_license: boolean;
}): ActivationCheckResult {
  const missing: string[] = [];

  const razon = input.razon_social.trim().toLowerCase();
  if (!razon || razon === PLACEHOLDER_RAZON) {
    missing.push("Razón social completa");
  }

  if (!input.rut_cuit.trim() || input.rut_cuit.startsWith("PEND-")) {
    missing.push("CUIT válido (no provisional)");
  } else if (!isValidRutCuit(input.rut_cuit)) {
    missing.push("CUIT con formato válido");
  }

  if (!input.tipo_entidad.trim() || input.tipo_entidad === "pendiente") {
    missing.push("Tipo de entidad definido (catálogo)");
  }

  const email = input.primary_email.trim().toLowerCase();
  if (!email || email.endsWith(PEND_EMAIL_SUFFIX) || !isValidEmail(email)) {
    missing.push("Email de contacto principal válido");
  }

  const phone = input.primary_phone.trim();
  if (!phone || phone === "0000000000" || !isValidPhone(phone)) {
    missing.push("Teléfono de contacto principal válido");
  }

  if (!input.has_active_license) {
    missing.push("Al menos una licencia activa");
  }

  return { ready: missing.length === 0, missing };
}
