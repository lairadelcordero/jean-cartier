"use client";

import { useCallback, useEffect, useState } from "react";

type Licenciatario = { id: string; razon_social: string; rut_cuit: string };
type TermHistory = {
  id: string;
  payment_model: string;
  contract_type?: "one_time" | "installments";
  billing_frequency?: "monthly" | "quarterly" | "semiannual" | "annual" | null;
  base_tariff_amount: number;
  currency?: "ARS" | "USD";
  usd_ars_exchange_rate?: number | null;
  installments_count?: number | null;
  effective_date: string;
  end_date: string | null;
  created_at: string;
};
type Payment = {
  id: string;
  payment_date: string;
  amount: number;
  currency: string;
  payment_method: string;
  reference: string | null;
  status: string;
  fx_rate_used?: number | null;
  fx_date?: string | null;
  fx_reference_note?: string | null;
  amount_ars_equivalent?: number | null;
  notes?: string | null;
};

type CommercialTermsProps = {
  licenciatarioId?: string;
  licenciatarioLabel?: string;
};

export function AdminCommercialTermsClient({
  licenciatarioId: fixedLicId,
  licenciatarioLabel,
}: CommercialTermsProps = {}) {
  const embedded = Boolean(fixedLicId);
  const [licenciatarios, setLicenciatarios] = useState<Licenciatario[]>([]);
  const [selectedLicenciatario, setSelectedLicenciatario] = useState(fixedLicId ?? "");
  const [history, setHistory] = useState<TermHistory[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [termsDraft, setTermsDraft] = useState({
    contract_type: "installments" as "one_time" | "installments",
    billing_frequency: "monthly" as "monthly" | "quarterly" | "semiannual" | "annual",
    base_tariff_amount: "0",
    currency: "ARS" as "ARS" | "USD",
    usd_ars_exchange_rate: "",
    installments_count: "12",
    effective_date: new Date().toISOString().slice(0, 10),
    end_date: "",
    payment_due_day: "15",
  });
  const [paymentDraft, setPaymentDraft] = useState({
    payment_date: new Date().toISOString().slice(0, 10),
    amount: "0",
    currency: "ARS" as "ARS" | "USD",
    payment_method: "bank_transfer",
    reference: "",
    notes: "",
    fx_rate_used: "",
    fx_date: new Date().toISOString().slice(0, 10),
    fx_reference_note: "",
  });

  const loadLicenciatarios = useCallback(async () => {
    const res = await fetch("/api/v1/admin/licenciatarios?limit=200", { cache: "no-store" });
    const body = (await res.json()) as { data?: Licenciatario[]; error?: string };
    if (!res.ok) {
      setError(body.error ?? "No se pudo cargar licenciatarios");
      return;
    }
    const rows = body.data ?? [];
    setLicenciatarios(rows);
    if (!selectedLicenciatario && rows.length > 0) setSelectedLicenciatario(rows[0].id);
  }, [selectedLicenciatario]);

  const loadData = useCallback(async (licenciatarioId: string) => {
    const [historyRes, paymentsRes] = await Promise.all([
      fetch(`/api/v1/admin/licenciatarios/${licenciatarioId}/commercial-terms/history?limit=20`, {
        cache: "no-store",
      }),
      fetch(`/api/v1/admin/licenciatarios/${licenciatarioId}/payments?limit=20`, {
        cache: "no-store",
      }),
    ]);
    const historyBody = (await historyRes.json()) as { data?: TermHistory[]; error?: string };
    const paymentsBody = (await paymentsRes.json()) as { data?: Payment[]; error?: string };
    if (!historyRes.ok || !paymentsRes.ok) {
      setError(historyBody.error ?? paymentsBody.error ?? "No se pudo cargar historial");
      return;
    }
    setHistory(historyBody.data ?? []);
    setPayments(paymentsBody.data ?? []);
  }, []);

  useEffect(() => {
    if (embedded) {
      if (fixedLicId) setSelectedLicenciatario(fixedLicId);
      return;
    }
    void loadLicenciatarios();
  }, [embedded, fixedLicId, loadLicenciatarios]);

  useEffect(() => {
    if (selectedLicenciatario) void loadData(selectedLicenciatario);
  }, [selectedLicenciatario, loadData]);

  async function saveTerms(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLicenciatario) return;
    setSaving(true);
    setError(null);
    const res = await fetch(
      `/api/v1/admin/licenciatarios/${selectedLicenciatario}/commercial-terms`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_model: "custom",
          contract_type: termsDraft.contract_type,
          billing_frequency:
            termsDraft.contract_type === "installments" ? termsDraft.billing_frequency : null,
          base_tariff_amount: Number(termsDraft.base_tariff_amount),
          currency: termsDraft.currency,
          usd_ars_exchange_rate:
            termsDraft.currency === "USD" && termsDraft.usd_ars_exchange_rate
              ? Number(termsDraft.usd_ars_exchange_rate)
              : null,
          installments_count:
            termsDraft.contract_type === "installments" && termsDraft.installments_count
              ? Number(termsDraft.installments_count)
              : null,
          effective_date: termsDraft.effective_date,
          end_date: termsDraft.end_date || null,
          payment_due_day: Number(termsDraft.payment_due_day),
          tariff_tiers: [],
        }),
      }
    );
    const body = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(body.error ?? "No se pudieron guardar términos");
      setSaving(false);
      return;
    }
    await loadData(selectedLicenciatario);
    setSaving(false);
  }

  async function recordPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLicenciatario) return;
    setSaving(true);
    setError(null);
    const payload: Record<string, unknown> = {
      payment_date: paymentDraft.payment_date,
      amount: Number(paymentDraft.amount),
      currency: paymentDraft.currency,
      payment_method: paymentDraft.payment_method,
      reference: paymentDraft.reference || null,
      notes: paymentDraft.notes || null,
    };
    if (paymentDraft.currency === "USD") {
      payload.fx_rate_used = Number(paymentDraft.fx_rate_used);
      payload.fx_date = paymentDraft.fx_date || paymentDraft.payment_date;
      payload.fx_reference_note = paymentDraft.fx_reference_note || null;
    }
    const res = await fetch(`/api/v1/admin/licenciatarios/${selectedLicenciatario}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(body.error ?? "No se pudo registrar pago");
      setSaving(false);
      return;
    }
    setPaymentDraft((prev) => ({
      ...prev,
      amount: "0",
      reference: "",
      notes: "",
      fx_rate_used: "",
      fx_reference_note: "",
    }));
    await loadData(selectedLicenciatario);
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      {error ? <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {embedded ? (
        <div className="rounded-lg border border-jc-gray-100 bg-jc-gray-50/80 px-4 py-3 text-sm text-jc-gray-700">
          <p className="font-medium text-jc-black">Términos comerciales y pagos registrados</p>
          {licenciatarioLabel ? (
            <p className="mt-0.5">
              Datos de gestión vinculados a <span className="font-medium">{licenciatarioLabel}</span>{" "}
              (contrato acordado e historial de cobros). No sustituye al libro contable ni al sistema
              financiero corporativo.
            </p>
          ) : (
            <p className="mt-0.5">
              Información asociada a la ficha del licenciatario; no es la parte contable central de la
              empresa.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-jc-gray-100 bg-jc-white p-4">
          <label htmlFor="commercial-terms-licenciatario" className="mb-2 block text-sm font-medium">
            Licenciatario
          </label>
          <select
            id="commercial-terms-licenciatario"
            className="w-full max-w-xl rounded border border-jc-gray-100 px-3 py-2"
            value={selectedLicenciatario}
            onChange={(e) => setSelectedLicenciatario(e.target.value)}
          >
            {licenciatarios.map((lic) => (
              <option key={lic.id} value={lic.id}>
                {lic.razon_social} ({lic.rut_cuit})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <form
          onSubmit={(e) => void saveTerms(e)}
          className="space-y-3 rounded-xl border border-jc-gray-100 bg-jc-white p-4"
        >
          <h3 className="text-base font-semibold">Contrato comercial (Argentina)</h3>
          <label className="block text-sm">
            <span className="mb-1 block text-jc-gray-700">Tipo de contrato</span>
            <select
              className="w-full rounded border border-jc-gray-100 px-3 py-2"
              value={termsDraft.contract_type}
              onChange={(e) =>
                setTermsDraft((prev) => ({
                  ...prev,
                  contract_type: e.target.value as "one_time" | "installments",
                }))
              }
            >
              <option value="one_time">Un solo pago</option>
              <option value="installments">Plan de pagos</option>
            </select>
          </label>
          {termsDraft.contract_type === "installments" ? (
            <label className="block text-sm">
              <span className="mb-1 block text-jc-gray-700">Frecuencia de pago</span>
              <select
                className="w-full rounded border border-jc-gray-100 px-3 py-2"
                value={termsDraft.billing_frequency}
                onChange={(e) =>
                  setTermsDraft((prev) => ({
                    ...prev,
                    billing_frequency: e.target.value as
                      | "monthly"
                      | "quarterly"
                      | "semiannual"
                      | "annual",
                  }))
                }
              >
                <option value="monthly">Mensual</option>
                <option value="quarterly">Trimestral</option>
                <option value="semiannual">Semestral</option>
                <option value="annual">Anual</option>
              </select>
            </label>
          ) : null}
          {termsDraft.contract_type === "installments" ? (
            <label className="block text-sm">
              <span className="mb-1 block text-jc-gray-700">Cantidad de cuotas (opcional)</span>
              <input
                className="w-full rounded border border-jc-gray-100 px-3 py-2"
                type="number"
                min={1}
                value={termsDraft.installments_count}
                onChange={(e) =>
                  setTermsDraft((prev) => ({ ...prev, installments_count: e.target.value }))
                }
              />
            </label>
          ) : null}
          <label className="block text-sm">
            <span className="mb-1 block text-jc-gray-700">Moneda del contrato</span>
            <select
              className="w-full rounded border border-jc-gray-100 px-3 py-2"
              value={termsDraft.currency}
              onChange={(e) =>
                setTermsDraft((prev) => ({ ...prev, currency: e.target.value as "ARS" | "USD" }))
              }
            >
              <option value="ARS">Pesos argentinos (ARS)</option>
              <option value="USD">Dolares estadounidenses (USD)</option>
            </select>
          </label>
          {termsDraft.currency === "USD" ? (
            <label className="block text-sm">
              <span className="mb-1 block text-jc-gray-700">
                Tipo de cambio de referencia (US$1 = AR$X)
              </span>
              <input
                className="w-full rounded border border-jc-gray-100 px-3 py-2"
                type="number"
                min={0}
                step="0.01"
                placeholder="Ej: 1100"
                value={termsDraft.usd_ars_exchange_rate}
                onChange={(e) =>
                  setTermsDraft((prev) => ({ ...prev, usd_ars_exchange_rate: e.target.value }))
                }
              />
            </label>
          ) : null}
          <label className="block text-sm">
            <span className="mb-1 block text-jc-gray-700">Monto mensual/acordado</span>
            <input
              className="w-full rounded border border-jc-gray-100 px-3 py-2"
              type="number"
              step="0.01"
              value={termsDraft.base_tariff_amount}
              onChange={(e) =>
                setTermsDraft((prev) => ({ ...prev, base_tariff_amount: e.target.value }))
              }
            />
          </label>
          <input
            className="w-full rounded border border-jc-gray-100 px-3 py-2"
            type="date"
            value={termsDraft.effective_date}
            onChange={(e) => setTermsDraft((prev) => ({ ...prev, effective_date: e.target.value }))}
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-jc-black px-4 py-2 text-sm font-medium text-jc-white disabled:opacity-50"
          >
            Guardar términos
          </button>
        </form>

        <form
          onSubmit={(e) => void recordPayment(e)}
          className="space-y-3 rounded-xl border border-jc-gray-100 bg-jc-white p-4"
        >
          <h3 className="text-base font-semibold">Registrar pago</h3>
          <input
            className="w-full rounded border border-jc-gray-100 px-3 py-2"
            type="date"
            value={paymentDraft.payment_date}
            onChange={(e) => setPaymentDraft((prev) => ({ ...prev, payment_date: e.target.value }))}
          />
          <input
            className="w-full rounded border border-jc-gray-100 px-3 py-2"
            type="number"
            step="0.01"
            value={paymentDraft.amount}
            onChange={(e) => setPaymentDraft((prev) => ({ ...prev, amount: e.target.value }))}
          />
          <select
            className="w-full rounded border border-jc-gray-100 px-3 py-2"
            value={paymentDraft.currency}
            onChange={(e) =>
              setPaymentDraft((prev) => ({ ...prev, currency: e.target.value as "ARS" | "USD" }))
            }
          >
            <option value="ARS">ARS</option>
            <option value="USD">USD</option>
          </select>
          {paymentDraft.currency === "USD" ? (
            <>
              <label className="block text-sm" htmlFor="pay-fx-rate">
                <span className="mb-1 block text-jc-gray-700">
                  Tipo de cambio del pago (US$1 = AR$X)
                </span>
                <input
                  id="pay-fx-rate"
                  className="w-full rounded border border-jc-gray-100 px-3 py-2"
                  type="number"
                  step="0.0001"
                  min={0}
                  value={paymentDraft.fx_rate_used}
                  onChange={(e) =>
                    setPaymentDraft((prev) => ({ ...prev, fx_rate_used: e.target.value }))
                  }
                />
              </label>
              <label className="block text-sm" htmlFor="pay-fx-date">
                <span className="mb-1 block text-jc-gray-700">Fecha de la cotización</span>
                <input
                  id="pay-fx-date"
                  className="w-full rounded border border-jc-gray-100 px-3 py-2"
                  type="date"
                  value={paymentDraft.fx_date}
                  onChange={(e) =>
                    setPaymentDraft((prev) => ({ ...prev, fx_date: e.target.value }))
                  }
                />
              </label>
              <label className="block text-sm" htmlFor="pay-fx-note">
                <span className="mb-1 block text-jc-gray-700">Referencia / fuente (opcional)</span>
                <input
                  id="pay-fx-note"
                  className="w-full rounded border border-jc-gray-100 px-3 py-2"
                  value={paymentDraft.fx_reference_note}
                  onChange={(e) =>
                    setPaymentDraft((prev) => ({ ...prev, fx_reference_note: e.target.value }))
                  }
                />
              </label>
            </>
          ) : null}
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-jc-black px-4 py-2 text-sm font-medium text-jc-white disabled:opacity-50"
          >
            Registrar pago
          </button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-jc-gray-100 bg-jc-white p-4">
          <h3 className="mb-3 text-base font-semibold">Historial de términos</h3>
          <div className="space-y-2 text-sm">
            {history.map((item) => (
              <div key={item.id} className="rounded bg-jc-gray-50 p-2">
                <p>
                  {item.contract_type === "one_time" ? "Un pago" : "Plan de pagos"} ·{" "}
                  {item.base_tariff_amount} {item.currency ?? "ARS"}
                </p>
                <p>
                  {item.effective_date} - {item.end_date ?? "vigente"}
                </p>
                {item.contract_type === "installments" && item.billing_frequency ? (
                  <p>Frecuencia: {item.billing_frequency}</p>
                ) : null}
                {item.currency === "USD" && item.usd_ars_exchange_rate ? (
                  <p>TC referencia: US$1 = AR${item.usd_ars_exchange_rate}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-jc-gray-100 bg-jc-white p-4">
          <h3 className="mb-3 text-base font-semibold">Pagos</h3>
          <div className="space-y-2 text-sm">
            {payments.map((payment) => (
              <div key={payment.id} className="rounded bg-jc-gray-50 p-2">
                <p>
                  {payment.payment_date} · {payment.amount} {payment.currency}
                </p>
                {payment.currency === "USD" && payment.fx_rate_used != null ? (
                  <p className="text-xs text-jc-gray-600">
                    TC pago: US$1 = AR${payment.fx_rate_used}
                    {payment.amount_ars_equivalent != null
                      ? ` · Equivalente ARS ${payment.amount_ars_equivalent}`
                      : ""}
                  </p>
                ) : null}
                <p>
                  {payment.payment_method} · {payment.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
