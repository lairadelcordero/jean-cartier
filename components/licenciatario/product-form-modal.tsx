"use client";

import type { ProductFieldError } from "@/lib/licenciatario/product-validation";
import type { ProductStatus } from "@/types/database";
import { useEffect, useState } from "react";

export type ProductFormValues = {
  name: string;
  sku: string;
  description: string;
  price: string;
  stock: string;
  status: ProductStatus;
};

const emptyForm: ProductFormValues = {
  name: "",
  sku: "",
  description: "",
  price: "",
  stock: "0",
  status: "active",
};

function mergeFieldErrors(details: ProductFieldError[]): Record<string, string> {
  const m: Record<string, string> = {};
  for (const d of details) {
    m[d.field] = d.message;
  }
  return m;
}

export function ProductFormModal(props: {
  open: boolean;
  title: string;
  licenseId: string;
  productId?: string;
  initial?: Partial<ProductFormValues> | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { open, title, licenseId, productId, initial, onClose, onSaved } = props;
  const [values, setValues] = useState<ProductFormValues>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFieldErrors({});
    setSubmitError(null);
    if (initial) {
      setValues({
        name: initial.name ?? "",
        sku: initial.sku ?? "",
        description: initial.description ?? "",
        price: initial.price ?? "",
        stock: initial.stock ?? "0",
        status: initial.status ?? "active",
      });
    } else {
      setValues(emptyForm);
    }
  }, [open, initial]);

  if (!open) {
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setSubmitError(null);
    setSaving(true);
    const body = {
      name: values.name,
      sku: values.sku,
      description: values.description.trim() === "" ? null : values.description,
      price: values.price === "" ? null : Number.parseFloat(String(values.price).replace(",", ".")),
      stock: values.stock === "" ? null : Number.parseInt(values.stock, 10),
      status: values.status,
    };
    const url =
      productId !== undefined
        ? `/api/licenciatario/licenses/${licenseId}/products/${productId}`
        : `/api/licenciatario/licenses/${licenseId}/products`;
    const res = await fetch(url, {
      method: productId !== undefined ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    const json = (await res.json()) as {
      error?: string;
      details?: ProductFieldError[];
      message?: string;
    };
    if (!res.ok) {
      if (json.details?.length) {
        setFieldErrors(mergeFieldErrors(json.details));
      }
      if (res.status >= 500) {
        setSubmitError(
          productId
            ? "Failed to update product. Please try again."
            : "Failed to create product. Please try again."
        );
      } else if (!json.details?.length) {
        setSubmitError(json.message ?? json.error ?? "Error al guardar");
      }
      return;
    }
    onSaved();
    onClose();
  }

  return (
    <dialog
      open
      className="fixed inset-0 z-50 m-0 flex h-[100dvh] w-full max-w-none items-center justify-center border-0 bg-black/50 p-4 font-inter open:flex"
      aria-labelledby="product-form-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded border border-jc-gray-100 bg-gradient-surface shadow-lg">
        <div className="flex items-center justify-between border-b border-jc-gray-100 px-6 py-4">
          <h2
            id="product-form-title"
            className="font-sans text-title-sm font-heading text-jc-black"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-jc-gray-500 hover:text-jc-black"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <form onSubmit={(e) => void onSubmit(e)} className="px-6 py-4">
          {submitError && (
            <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {submitError}
            </p>
          )}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="pf-name"
                className="text-nav font-medium uppercase tracking-ribbon text-jc-gray-500"
              >
                Nombre del producto *
              </label>
              <input
                id="pf-name"
                value={values.name}
                onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                className="mt-1 w-full rounded border border-jc-gray-300 px-3 py-2 text-sm text-jc-black focus:border-jc-gold focus:outline-none focus:ring-1 focus:ring-jc-gold"
                placeholder="Ej: Cartera de cuero negro"
                required
              />
              {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="pf-sku"
                  className="text-nav font-medium uppercase tracking-ribbon text-jc-gray-500"
                >
                  SKU *
                </label>
                <input
                  id="pf-sku"
                  value={values.sku}
                  onChange={(e) => setValues((v) => ({ ...v, sku: e.target.value }))}
                  className="mt-1 w-full rounded border border-jc-gray-300 px-3 py-2 font-mono text-sm text-jc-black focus:border-jc-gold focus:outline-none focus:ring-1 focus:ring-jc-gold"
                  placeholder="CRT-001"
                  required
                />
                {fieldErrors.sku && <p className="mt-1 text-xs text-red-600">{fieldErrors.sku}</p>}
              </div>
              <div>
                <label
                  htmlFor="pf-price"
                  className="text-nav font-medium uppercase tracking-ribbon text-jc-gray-500"
                >
                  Precio *
                </label>
                <input
                  id="pf-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={values.price}
                  onChange={(e) => setValues((v) => ({ ...v, price: e.target.value }))}
                  className="mt-1 w-full rounded border border-jc-gray-300 px-3 py-2 text-sm text-jc-black focus:border-jc-gold focus:outline-none focus:ring-1 focus:ring-jc-gold"
                  placeholder="0.00"
                  required
                />
                {fieldErrors.price && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.price}</p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="pf-desc"
                className="text-nav font-medium uppercase tracking-ribbon text-jc-gray-500"
              >
                Descripción
              </label>
              <textarea
                id="pf-desc"
                value={values.description}
                onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
                className="mt-1 min-h-[5rem] w-full resize-y rounded border border-jc-gray-300 px-3 py-2 text-sm text-jc-black focus:border-jc-gold focus:outline-none focus:ring-1 focus:ring-jc-gold"
                placeholder="Descripción del producto…"
              />
              {fieldErrors.description && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.description}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="pf-stock"
                className="text-nav font-medium uppercase tracking-ribbon text-jc-gray-500"
              >
                Stock *
              </label>
              <input
                id="pf-stock"
                type="number"
                min="0"
                step="1"
                value={values.stock}
                onChange={(e) => setValues((v) => ({ ...v, stock: e.target.value }))}
                className="mt-1 w-full rounded border border-jc-gray-300 px-3 py-2 text-sm text-jc-black focus:border-jc-gold focus:outline-none focus:ring-1 focus:ring-jc-gold"
                required
              />
              {fieldErrors.stock && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.stock}</p>
              )}
            </div>
            <div>
              <span className="text-nav font-medium uppercase tracking-ribbon text-jc-gray-500">
                Estado
              </span>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={values.status === "active"}
                  onClick={() =>
                    setValues((v) => ({
                      ...v,
                      status: v.status === "active" ? "inactive" : "active",
                    }))
                  }
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${values.status === "active" ? "bg-jc-gold" : "bg-jc-gray-300"}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-jc-white shadow transition ${values.status === "active" ? "left-5" : "left-0.5"}`}
                  />
                </button>
                <span className="text-sm text-jc-gray-700">
                  {values.status === "active" ? "Activo" : "Inactivo"}
                </span>
              </div>
              {fieldErrors.status && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.status}</p>
              )}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-jc-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-jc-gray-300 bg-jc-gray-50 px-4 py-2 text-sm font-medium text-jc-black hover:bg-jc-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded border border-jc-gray-900 bg-jc-black px-4 py-2 text-sm font-medium text-jc-white disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Guardar producto"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
