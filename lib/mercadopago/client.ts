export const MERCADO_PAGO_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY ?? "";

export const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN ?? "";

/**
 * Base URL for Mercado Pago REST API.
 * Use this in server-side fetch calls to interact with payment methods,
 * preferences, and other Mercado Pago resources.
 */
export const MERCADO_PAGO_API_URL = "https://api.mercadopago.com";

/**
 * Creates an authenticated headers object for Mercado Pago API requests.
 * Only call this on the server side where the access token is available.
 */
export function getMercadoPagoHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
}
