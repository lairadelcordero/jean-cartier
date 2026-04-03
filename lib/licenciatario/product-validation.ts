import type { ProductStatus } from "@/types/database";

export type ProductFieldError = { field: string; message: string };

const SKU_PATTERN = /^[a-zA-Z0-9-]+$/;
const MAX_NAME = 255;
const MAX_SKU = 50;
const MAX_DESC = 1000;
const MAX_PRICE = 999_999.99;
const MAX_STOCK = 999_999;

type RawInput = {
  name?: unknown;
  sku?: unknown;
  description?: unknown;
  price?: unknown;
  stock?: unknown;
  status?: unknown;
};

export function validateProductInput(
  body: RawInput
): { ok: true; data: ProductPayload } | { ok: false; details: ProductFieldError[] } {
  const details: ProductFieldError[] = [];
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    details.push({ field: "name", message: "Product name is required" });
  } else if (name.length > MAX_NAME) {
    details.push({ field: "name", message: `Name must be at most ${MAX_NAME} characters` });
  }

  const skuRaw = typeof body.sku === "string" ? body.sku.trim() : "";
  if (!skuRaw) {
    details.push({ field: "sku", message: "SKU is required" });
  } else if (skuRaw.length > MAX_SKU) {
    details.push({ field: "sku", message: `SKU must be at most ${MAX_SKU} characters` });
  } else if (!SKU_PATTERN.test(skuRaw)) {
    details.push({
      field: "sku",
      message: "SKU may only contain letters, numbers, and hyphens",
    });
  }

  const description =
    body.description === null || body.description === undefined
      ? null
      : typeof body.description === "string"
        ? body.description.trim() || null
        : undefined;
  if (description === undefined) {
    details.push({ field: "description", message: "Description must be a string" });
  } else if (description && description.length > MAX_DESC) {
    details.push({
      field: "description",
      message: `Description must be at most ${MAX_DESC} characters`,
    });
  }

  let priceNum: number | undefined;
  if (body.price === null || body.price === undefined || body.price === "") {
    details.push({ field: "price", message: "Price must be a positive number" });
  } else {
    const p =
      typeof body.price === "number"
        ? body.price
        : typeof body.price === "string"
          ? Number(body.price)
          : Number.NaN;
    if (!Number.isFinite(p) || p <= 0) {
      details.push({ field: "price", message: "Price must be a positive number" });
    } else if (p > MAX_PRICE) {
      details.push({ field: "price", message: `Price must be at most ${MAX_PRICE}` });
    } else {
      priceNum = Math.round(p * 100) / 100;
    }
  }

  let stockNum: number | undefined;
  if (body.stock === null || body.stock === undefined || body.stock === "") {
    details.push({ field: "stock", message: "Stock must be a non-negative number" });
  } else {
    const s =
      typeof body.stock === "number"
        ? body.stock
        : typeof body.stock === "string"
          ? Number.parseInt(body.stock, 10)
          : Number.NaN;
    if (!Number.isInteger(s) || s < 0) {
      details.push({ field: "stock", message: "Stock must be a non-negative number" });
    } else if (s > MAX_STOCK) {
      details.push({ field: "stock", message: `Stock must be at most ${MAX_STOCK}` });
    } else {
      stockNum = s;
    }
  }

  const statusRaw = body.status;
  let status: ProductStatus = "active";
  if (statusRaw !== undefined && statusRaw !== null) {
    if (statusRaw !== "active" && statusRaw !== "inactive") {
      details.push({ field: "status", message: "Status must be active or inactive" });
    } else {
      status = statusRaw;
    }
  }

  if (details.length > 0) {
    return { ok: false, details };
  }

  return {
    ok: true,
    data: {
      name,
      sku: skuRaw,
      description: description as string | null,
      price: priceNum as number,
      stock: stockNum as number,
      status,
    },
  };
}

export type ProductPayload = {
  name: string;
  sku: string;
  description: string | null;
  price: number;
  stock: number;
  status: ProductStatus;
};
