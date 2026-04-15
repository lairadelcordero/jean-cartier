"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Customer = { id: string; email: string; role: string; created_at: string };
type BillingPayload = {
  customer: Customer;
  tax_profile: {
    legal_name: string | null;
    tax_id: string | null;
    tax_condition: string | null;
    billing_address: string | null;
    city: string | null;
    country: string | null;
    postal_code: string | null;
  } | null;
  orders: Array<{ id: string; status: string; total: number | null; created_at: string }>;
  order_items: Array<{
    order_id: string;
    product_id: string;
    quantity: number;
    price: number | null;
  }>;
  payments: Array<{
    id: string;
    order_id: string | null;
    provider: string;
    amount: number;
    currency: string;
    status: string;
    paid_at: string | null;
    created_at: string;
  }>;
};

export function AdminCustomersClient() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [billing, setBilling] = useState<BillingPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [taxDraft, setTaxDraft] = useState<Record<string, string>>({});

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/customers", { cache: "no-store" });
    const body = (await res.json()) as { data?: Customer[]; error?: string };
    if (!res.ok) {
      setError(body.error ?? "No se pudo cargar clientes");
      setLoading(false);
      return;
    }
    const rows = body.data ?? [];
    setCustomers(rows);
    if (!selected && rows.length > 0) setSelected(rows[0].id);
    setLoading(false);
  }, [selected]);

  const loadBilling = useCallback(async (customerId: string) => {
    setError(null);
    const res = await fetch(`/api/admin/customers/${customerId}/billing`, { cache: "no-store" });
    const body = (await res.json()) as { data?: BillingPayload; error?: string };
    if (!res.ok) {
      setError(body.error ?? "No se pudo cargar detalle");
      return;
    }
    const data = body.data ?? null;
    setBilling(data);
    setTaxDraft({
      legal_name: data?.tax_profile?.legal_name ?? "",
      tax_id: data?.tax_profile?.tax_id ?? "",
      tax_condition: data?.tax_profile?.tax_condition ?? "",
      billing_address: data?.tax_profile?.billing_address ?? "",
      city: data?.tax_profile?.city ?? "",
      country: data?.tax_profile?.country ?? "",
      postal_code: data?.tax_profile?.postal_code ?? "",
    });
  }, []);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    if (selected) void loadBilling(selected);
  }, [selected, loadBilling]);

  const totalPayments = useMemo(
    () => (billing?.payments ?? []).reduce((acc, payment) => acc + Number(payment.amount ?? 0), 0),
    [billing]
  );

  async function saveTaxProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    const res = await fetch(`/api/admin/customers/${selected}/billing`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taxDraft),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(body.error ?? "No se pudo guardar perfil fiscal");
      setSaving(false);
      return;
    }
    await loadBilling(selected);
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      {error ? <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <div className="rounded-xl border border-jc-gray-100 bg-jc-white p-4">
        <label htmlFor="customer-select" className="mb-2 block text-sm font-medium">
          Cliente
        </label>
        <select
          id="customer-select"
          className="w-full max-w-lg rounded border border-jc-gray-100 px-3 py-2"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {loading ? <option>Cargando...</option> : null}
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.email}
            </option>
          ))}
        </select>
      </div>

      {billing ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-jc-gray-100 bg-jc-white p-4">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide">Compras</h2>
              <p className="text-2xl font-semibold">{billing.orders.length}</p>
            </div>
            <div className="rounded-xl border border-jc-gray-100 bg-jc-white p-4">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide">Pagos</h2>
              <p className="text-2xl font-semibold">{billing.payments.length}</p>
            </div>
            <div className="rounded-xl border border-jc-gray-100 bg-jc-white p-4">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide">Monto pagado</h2>
              <p className="text-2xl font-semibold">
                {totalPayments.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => void saveTaxProfile(e)}
            className="grid gap-3 rounded-xl border border-jc-gray-100 bg-jc-white p-4 md:grid-cols-2"
          >
            <h3 className="md:col-span-2 text-lg font-semibold">Datos fiscales</h3>
            {Object.entries(taxDraft).map(([key, value]) => (
              <label key={key} className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wide text-jc-gray-500">
                  {key}
                </span>
                <input
                  className="w-full rounded border border-jc-gray-100 px-3 py-2"
                  value={value}
                  onChange={(e) => setTaxDraft((prev) => ({ ...prev, [key]: e.target.value }))}
                />
              </label>
            ))}
            <button
              type="submit"
              disabled={saving}
              className="md:col-span-2 rounded bg-jc-black px-4 py-2 text-sm font-medium text-jc-white disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar perfil fiscal"}
            </button>
          </form>

          <div className="overflow-x-auto rounded-xl border border-jc-gray-100 bg-jc-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-jc-gray-100 bg-jc-gray-50 text-left">
                  <th className="px-3 py-2">Orden</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {billing.orders.map((order) => (
                  <tr key={order.id} className="border-b border-jc-gray-100">
                    <td className="px-3 py-2 font-mono text-xs">{order.id}</td>
                    <td className="px-3 py-2">{order.status}</td>
                    <td className="px-3 py-2">{order.total ?? "-"}</td>
                    <td className="px-3 py-2">{new Date(order.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}
