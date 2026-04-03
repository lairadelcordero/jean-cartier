"use client";

import { formatDateIso, formatMoney } from "@/lib/licenciatario/format";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProductFormModal, type ProductFormValues } from "./product-form-modal";
import { ProductStatusBadge } from "./status-badge";

const PAGE_SIZE = 20;

export type ProductDto = {
  id: string;
  license_id: string;
  name: string;
  sku: string;
  description: string | null;
  price: number | null;
  stock: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

export function LicenseProductsClient({
  licenseId,
  categoryLabel,
}: {
  licenseId: string;
  categoryLabel: string;
}) {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null);
  const [viewProduct, setViewProduct] = useState<ProductDto | null>(null);

  const loadProducts = useCallback(async () => {
    setLoadError(null);
    const res = await fetch(`/api/licenciatario/licenses/${licenseId}/products`);
    if (!res.ok) {
      setLoadError("No se pudieron cargar los productos.");
      setProducts([]);
      setLoading(false);
      return;
    }
    const json = (await res.json()) as { data: ProductDto[] };
    setProducts(json.data ?? []);
    setLoading(false);
  }, [licenseId]);

  useEffect(() => {
    setLoading(true);
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`lic-products-${licenseId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
          filter: `license_id=eq.${licenseId}`,
        },
        () => {
          void loadProducts();
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [licenseId, loadProducts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }, [products, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  function openAdd() {
    setFormMode("add");
    setEditingProduct(null);
    setFormOpen(true);
  }

  function openEdit(p: ProductDto) {
    setFormMode("edit");
    setEditingProduct(p);
    setFormOpen(true);
  }

  async function deactivateProduct(p: ProductDto) {
    if (!globalThis.confirm("¿Estás seguro?")) {
      return;
    }
    const res = await fetch(`/api/licenciatario/licenses/${licenseId}/products/${p.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      globalThis.alert("No se pudo desactivar el producto.");
      return;
    }
    void loadProducts();
  }

  const editInitial: Partial<ProductFormValues> | null = editingProduct
    ? {
        name: editingProduct.name,
        sku: editingProduct.sku,
        description: editingProduct.description ?? "",
        price: editingProduct.price != null ? String(editingProduct.price) : "",
        stock: String(editingProduct.stock),
        status: editingProduct.status,
      }
    : null;

  return (
    <>
      <Link
        href={`/licenciatario/licenses/${licenseId}`}
        className="mb-6 inline-flex text-sm font-medium text-jc-gold transition hover:text-jc-black"
      >
        ← Volver a detalles
      </Link>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-sans text-display-sm font-display text-jc-black md:text-title-lg">
          Productos — {categoryLabel}
        </h1>
        <button
          type="button"
          onClick={openAdd}
          className="rounded border border-jc-gray-900 bg-jc-black px-5 py-2.5 text-sm font-medium text-jc-white transition hover:bg-jc-gray-900"
        >
          + Agregar producto
        </button>
      </div>

      <div className="mb-6">
        <label htmlFor="product-search" className="sr-only">
          Buscar por nombre o SKU
        </label>
        <input
          id="product-search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar por nombre o SKU…"
          className="w-full rounded border border-jc-gray-300 bg-jc-white px-4 py-2.5 text-sm text-jc-black shadow-jc placeholder:text-jc-gray-500 focus:border-jc-gold focus:outline-none focus:ring-1 focus:ring-jc-gold md:max-w-md"
        />
      </div>

      {loadError && (
        <p className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {loadError}
        </p>
      )}

      {loading ? (
        <p className="text-jc-gray-600">Cargando…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded border border-jc-gray-100 bg-gradient-surface py-14 text-center shadow-jc">
          <p className="font-sans text-title-sm font-heading text-jc-black">No hay productos</p>
          <p className="mt-2 text-sm text-jc-gray-600">
            {search.trim()
              ? "No hay resultados para tu búsqueda."
              : "Agregá tu primer producto con el botón de arriba."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded border border-jc-gray-100 bg-gradient-surface shadow-jc md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-jc-gray-100 bg-jc-gray-50/80">
                  <th className="px-4 py-3 text-nav font-semibold uppercase tracking-ribbon text-jc-gray-500">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-nav font-semibold uppercase tracking-ribbon text-jc-gray-500">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-nav font-semibold uppercase tracking-ribbon text-jc-gray-500">
                    Precio
                  </th>
                  <th className="px-4 py-3 text-nav font-semibold uppercase tracking-ribbon text-jc-gray-500">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-nav font-semibold uppercase tracking-ribbon text-jc-gray-500">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-nav font-semibold uppercase tracking-ribbon text-jc-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-jc-gray-100 last:border-0 hover:bg-jc-gray-50/50"
                  >
                    <td className="px-4 py-3 font-medium text-jc-black">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-jc-gray-600">{p.sku}</td>
                    <td className="px-4 py-3 font-medium text-jc-gold">{formatMoney(p.price)}</td>
                    <td className="px-4 py-3 text-jc-gray-900">{p.stock}</td>
                    <td className="px-4 py-3">
                      <ProductStatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className="rounded border border-jc-gray-300 bg-jc-white px-2.5 py-1 text-xs font-medium text-jc-gold transition hover:bg-jc-gray-50"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewProduct(p)}
                          className="rounded border border-jc-gray-300 bg-jc-white px-2.5 py-1 text-xs font-medium text-jc-gold transition hover:bg-jc-gray-50"
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          disabled={p.status !== "active"}
                          onClick={() => void deactivateProduct(p)}
                          className="rounded border border-red-300 bg-jc-white px-2.5 py-1 text-xs font-medium text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Desactivar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-4 md:hidden">
            {pageItems.map((p) => (
              <li
                key={p.id}
                className="rounded border border-jc-gray-100 bg-gradient-surface p-4 shadow-jc"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-jc-black">{p.name}</p>
                    <p className="mt-1 font-mono text-xs text-jc-gray-600">{p.sku}</p>
                  </div>
                  <ProductStatusBadge status={p.status} />
                </div>
                <p className="mt-2 text-sm text-jc-gray-700">
                  {formatMoney(p.price)} · Stock {p.stock}
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="rounded border border-jc-gray-300 py-2 text-sm font-medium text-jc-gold"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewProduct(p)}
                    className="rounded border border-jc-gray-300 py-2 text-sm font-medium text-jc-gold"
                  >
                    Ver
                  </button>
                  <button
                    type="button"
                    disabled={p.status !== "active"}
                    onClick={() => void deactivateProduct(p)}
                    className="rounded border border-red-300 py-2 text-sm font-medium text-red-700 disabled:opacity-40"
                  >
                    Desactivar
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {filtered.length > PAGE_SIZE && (
            <nav
              className="mt-6 flex flex-wrap items-center justify-center gap-2"
              aria-label="Paginación"
            >
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded border border-jc-gray-300 bg-jc-white px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`rounded border px-3 py-1.5 text-sm ${
                    n === currentPage
                      ? "border-jc-gold bg-jc-gold text-jc-black"
                      : "border-jc-gray-300 bg-jc-white text-jc-black"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded border border-jc-gray-300 bg-jc-white px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Siguiente
              </button>
            </nav>
          )}
        </>
      )}

      <ProductFormModal
        open={formOpen}
        title={formMode === "add" ? "Agregar producto" : "Editar producto"}
        licenseId={licenseId}
        productId={editingProduct?.id}
        initial={editInitial}
        onClose={() => setFormOpen(false)}
        onSaved={() => void loadProducts()}
      />

      {viewProduct && (
        <dialog
          open
          aria-labelledby="view-product-title"
          className="fixed inset-0 z-50 m-0 flex h-[100dvh] w-full max-w-none items-center justify-center border-0 bg-black/50 p-4 font-inter open:flex"
        >
          <div className="w-full max-w-md rounded border border-jc-gray-100 bg-gradient-surface p-6 shadow-lg">
            <h2
              id="view-product-title"
              className="font-sans text-title-sm font-heading text-jc-black"
            >
              {viewProduct.name}
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-nav uppercase tracking-ribbon text-jc-gray-500">SKU</dt>
                <dd className="font-mono text-jc-gray-900">{viewProduct.sku}</dd>
              </div>
              <div>
                <dt className="text-nav uppercase tracking-ribbon text-jc-gray-500">Precio</dt>
                <dd className="text-jc-gold">{formatMoney(viewProduct.price)}</dd>
              </div>
              <div>
                <dt className="text-nav uppercase tracking-ribbon text-jc-gray-500">Stock</dt>
                <dd>{viewProduct.stock}</dd>
              </div>
              <div>
                <dt className="text-nav uppercase tracking-ribbon text-jc-gray-500">Estado</dt>
                <dd>
                  <ProductStatusBadge status={viewProduct.status} />
                </dd>
              </div>
              <div>
                <dt className="text-nav uppercase tracking-ribbon text-jc-gray-500">Descripción</dt>
                <dd className="text-jc-gray-700">{viewProduct.description || "—"}</dd>
              </div>
              <div>
                <dt className="text-nav uppercase tracking-ribbon text-jc-gray-500">Creado</dt>
                <dd>{formatDateIso(viewProduct.created_at)}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => setViewProduct(null)}
              className="mt-6 w-full rounded border border-jc-gray-900 bg-jc-black py-2 text-sm font-medium text-jc-white"
            >
              Cerrar
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}
