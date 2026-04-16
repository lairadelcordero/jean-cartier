"use client";

import { AdminStatusDot } from "@/components/admin/admin-status-dot";
import { useCallback, useEffect, useState } from "react";

type Licenciatario = { id: string; razon_social: string; rut_cuit: string };
type LicenseCategory = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  sort_order: number;
};
type LicenseTier = {
  id: string;
  name: string;
  code: string;
  base_price: number;
  exclusive_price_multiplier: number;
  active: boolean;
};
type AdminLicense = {
  id: string;
  licenciatario_id: string | null;
  category: string;
  category_name?: string;
  tier_name?: string | null;
  exclusive?: boolean;
  exclusive_scope?: "none" | "production" | "import" | "both";
  agreed_price?: number | null;
  status: "active" | "inactive" | "pending" | "expired";
  issue_date: string;
  expiration_date: string;
  renewal_date: string | null;
  created_date: string;
};

type RegistryLicense = {
  id: string;
  licenciatario_id: string | null;
  category: string;
  category_path: string;
  parent_category_name: string | null;
  licenciatario_razon_social: string | null;
  licenciatario_rut_cuit: string | null;
  exclusive?: boolean;
  exclusive_scope?: "none" | "production" | "import" | "both";
  status: AdminLicense["status"];
  issue_date: string;
  expiration_date: string;
};

/** Valor de selector: licencias sin titular en la base (`licenciatario_id` NULL). */
const VIEW_UNASSIGNED = "__unassigned__";

export function AdminLicensesClient() {
  const [registry, setRegistry] = useState<RegistryLicense[]>([]);
  const [licenses, setLicenses] = useState<AdminLicense[]>([]);
  const [licenciatarios, setLicenciatarios] = useState<Licenciatario[]>([]);
  const [categories, setCategories] = useState<LicenseCategory[]>([]);
  const [tiers, setTiers] = useState<LicenseTier[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedLicenciatario, setSelectedLicenciatario] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedTierId, setSelectedTierId] = useState("");
  const [exclusive, setExclusive] = useState(false);
  const [exclusiveScope, setExclusiveScope] = useState<"none" | "production" | "import" | "both">(
    "none"
  );
  const [agreedPrice, setAgreedPrice] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [expirationDate, setExpirationDate] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [notes, setNotes] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTierName, setNewTierName] = useState("");
  const [newTierBasePrice, setNewTierBasePrice] = useState("");
  const [newTierExclusiveMultiplier, setNewTierExclusiveMultiplier] = useState("1.25");

  const licenciatarioById = new Map(licenciatarios.map((lic) => [lic.id, lic]));

  function formatDate(value: string) {
    if (!value) return "-";
    return new Date(`${value}T00:00:00`).toLocaleDateString("es-AR");
  }

  function formatMoney(value?: number | null) {
    if (value == null) return "-";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);
  }

  function exclusivityLabel(
    exclusiveValue?: boolean,
    scope?: "none" | "production" | "import" | "both"
  ) {
    if (!exclusiveValue) return "No exclusiva (se puede asignar a varios)";
    if (scope === "production") return "Exclusiva en produccion";
    if (scope === "import") return "Exclusiva en importacion";
    if (scope === "both") return "Exclusiva total (produccion + importacion)";
    return "Exclusiva";
  }

  const loadRegistry = useCallback(async () => {
    const res = await fetch("/api/v1/admin/licenciatario-licenses/all?limit=200", {
      cache: "no-store",
    });
    const body = (await res.json()) as { data?: RegistryLicense[]; error?: string };
    if (!res.ok) {
      setError(body.error ?? "No se pudo cargar el listado global de licencias");
      return;
    }
    setRegistry(body.data ?? []);
  }, []);

  const loadLicenciatarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/v1/admin/licenciatarios?limit=200", { cache: "no-store" });
    const body = (await res.json()) as {
      data?: Array<{ id: string; razon_social: string; rut_cuit: string }>;
      error?: string;
    };
    if (!res.ok) {
      setError(body.error ?? "No se pudo cargar licenciatarios");
      setLoading(false);
      return;
    }
    setLicenciatarios(body.data ?? []);
    setSelectedLicenciatario((prev) => (prev ? prev : VIEW_UNASSIGNED));
    setLoading(false);
  }, []);

  const loadCatalogs = useCallback(async () => {
    const [categoriesRes, tiersRes] = await Promise.all([
      fetch("/api/v1/admin/license-categories", { cache: "no-store" }),
      fetch("/api/v1/admin/license-tiers", { cache: "no-store" }),
    ]);
    const categoriesBody = (await categoriesRes.json()) as {
      data?: LicenseCategory[];
      error?: string;
    };
    const tiersBody = (await tiersRes.json()) as { data?: LicenseTier[]; error?: string };
    if (!categoriesRes.ok || !tiersRes.ok) {
      setError(
        categoriesBody.error ?? tiersBody.error ?? "No se pudo cargar catálogo de licencias"
      );
      return;
    }
    const nextCategories = (categoriesBody.data ?? []).filter((row) => row.active);
    const nextTiers = (tiersBody.data ?? []).filter((row) => row.active);
    setCategories(nextCategories);
    setTiers(nextTiers);
    if (!selectedCategoryId && nextCategories.length > 0)
      setSelectedCategoryId(nextCategories[0].id);
    if (!selectedTierId && nextTiers.length > 0) setSelectedTierId(nextTiers[0].id);
  }, [selectedCategoryId, selectedTierId]);

  const loadLicenses = useCallback(async (selection: string) => {
    if (!selection) return;
    const url =
      selection === VIEW_UNASSIGNED
        ? "/api/v1/admin/licenses?unassigned=1&limit=200"
        : `/api/v1/admin/licenciatarios/${selection}/licenses?limit=200`;
    const res = await fetch(url, { cache: "no-store" });
    const body = (await res.json()) as { data?: AdminLicense[]; error?: string };
    if (!res.ok) {
      setError(body.error ?? "No se pudo cargar licencias");
      return;
    }
    setLicenses(body.data ?? []);
  }, []);

  useEffect(() => {
    void loadLicenciatarios();
    void loadRegistry();
  }, [loadLicenciatarios, loadRegistry]);

  useEffect(() => {
    void loadCatalogs();
  }, [loadCatalogs]);

  useEffect(() => {
    if (selectedLicenciatario) void loadLicenses(selectedLicenciatario);
  }, [selectedLicenciatario, loadLicenses]);

  async function assignLicense(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCategoryId || !expirationDate) return;
    setSaving(true);
    setError(null);
    const licenciatarioPayload: { licenciatario_id: string | null } =
      selectedLicenciatario === VIEW_UNASSIGNED
        ? { licenciatario_id: null }
        : { licenciatario_id: selectedLicenciatario };
    const res = await fetch("/api/v1/admin/licenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...licenciatarioPayload,
        category_id: selectedCategoryId,
        tier_id: selectedTierId || null,
        exclusive,
        exclusive_scope: exclusive ? exclusiveScope : "none",
        agreed_price: agreedPrice ? Number(agreedPrice) : null,
        issue_date: issueDate,
        expiration_date: expirationDate,
        terms_accepted: termsAccepted,
        notes,
      }),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(body.error ?? "No se pudo crear licencia");
      setSaving(false);
      return;
    }
    setNotes("");
    setAgreedPrice("");
    await loadLicenses(selectedLicenciatario);
    await loadRegistry();
    setSaving(false);
  }


  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!newCategoryName.trim()) return;
    const res = await fetch("/api/v1/admin/license-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName.trim() }),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(body.error ?? "No se pudo crear categoría");
      return;
    }
    setNewCategoryName("");
    await loadCatalogs();
  }

  async function createTier(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!newTierName.trim()) return;
    const res = await fetch("/api/v1/admin/license-tiers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newTierName.trim(),
        base_price: Number(newTierBasePrice),
        exclusive_price_multiplier: Number(newTierExclusiveMultiplier),
      }),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(body.error ?? "No se pudo crear nivel");
      return;
    }
    setNewTierName("");
    setNewTierBasePrice("");
    setNewTierExclusiveMultiplier("1.25");
    await loadCatalogs();
  }

  async function changeStatus(licenseId: string, status: "active" | "inactive" | "expired") {
    setError(null);
    const res = await fetch(`/api/v1/admin/licenses/${licenseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(body.error ?? "No se pudo actualizar estado");
      return;
    }
    await loadLicenses(selectedLicenciatario);
    await loadRegistry();
  }

  function licenseStatusTone(s: AdminLicense["status"]) {
    if (s === "active") return "active";
    if (s === "pending") return "pending";
    if (s === "expired") return "expired";
    return "inactive";
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-jc-gray-100 bg-jc-white p-4 shadow-jc">
        <h2 className="mb-1 text-lg font-semibold">Listado global de licencias</h2>
        <p className="mb-3 text-sm text-jc-gray-600">
          Vista jerárquica por rubro (cuando el catálogo tiene padres) y estado por licencia.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-jc-gray-100 bg-jc-gray-50 text-left">
                <th className="px-3 py-2 w-8" aria-hidden />
                <th className="px-3 py-2">Rubro</th>
                <th className="px-3 py-2">Licenciatario</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Exclusividad</th>
                <th className="px-3 py-2">Vencimiento</th>
              </tr>
            </thead>
            <tbody>
              {registry.length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-jc-gray-500" colSpan={6}>
                    No hay licencias registradas.
                  </td>
                </tr>
              ) : (
                registry.map((row) => (
                  <tr key={row.id} className="border-b border-jc-gray-100">
                    <td className="px-3 py-2">
                      <AdminStatusDot tone={licenseStatusTone(row.status)} label={row.status} />
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-medium">{row.category_path}</span>
                      {row.parent_category_name ? (
                        <span className="ml-1 text-xs text-jc-gray-500">
                          ({row.parent_category_name})
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">
                      {row.licenciatario_id == null
                        ? "Sin titular"
                        : (row.licenciatario_razon_social ?? "—")}
                      {row.licenciatario_id != null && row.licenciatario_rut_cuit ? (
                        <span className="block text-xs text-jc-gray-500">
                          {row.licenciatario_rut_cuit}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">{row.status}</td>
                    <td className="px-3 py-2">
                      {exclusivityLabel(row.exclusive, row.exclusive_scope)}
                    </td>
                    <td className="px-3 py-2">{formatDate(row.expiration_date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <form
        onSubmit={(e) => void assignLicense(e)}
        className="space-y-4 rounded-xl border border-jc-gray-100 bg-jc-white p-4"
      >
        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Titular (opcional)</span>
            <p className="text-xs font-normal leading-snug text-jc-gray-500">
              Podés crear la licencia solo con rubro y fechas; el titular se asocia cuando exista
              contraparte o unidad (aunque sea años después).
            </p>
            <select
              className="w-full rounded border border-jc-gray-100 px-3 py-2"
              value={selectedLicenciatario}
              onChange={(e) => setSelectedLicenciatario(e.target.value)}
              required
            >
              <option value={VIEW_UNASSIGNED}>Sin titular</option>
              {licenciatarios.map((lic) => (
                <option key={lic.id} value={lic.id}>
                  {lic.razon_social} ({lic.rut_cuit})
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium">Rubro / subrubro licenciado</span>
            <select
              className="w-full rounded border border-jc-gray-100 px-3 py-2"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              required
            >
              <option value="" disabled>
                Seleccionar rubro/subrubro
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium">Plan comercial (opcional)</span>
            <select
              className="w-full rounded border border-jc-gray-100 px-3 py-2"
              value={selectedTierId}
              onChange={(e) => setSelectedTierId(e.target.value)}
            >
              <option value="">Sin plan</option>
              {tiers.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Inicio</span>
            <input
              className="w-full rounded border border-jc-gray-100 px-3 py-2"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              required
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Vencimiento</span>
            <input
              className="w-full rounded border border-jc-gray-100 px-3 py-2"
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              required
            />
          </label>
          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-medium">Precio acordado de esta licencia (opcional)</span>
            <input
              className="w-full rounded border border-jc-gray-100 px-3 py-2"
              placeholder="Ej: 2500"
              type="number"
              step="0.01"
              value={agreedPrice}
              onChange={(e) => setAgreedPrice(e.target.value)}
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2 rounded border border-jc-gray-100 p-3 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={exclusive}
                onChange={(e) => setExclusive(e.target.checked)}
              />
              <span className="font-medium">Licencia exclusiva</span>
            </label>
            <p className="text-xs text-jc-gray-500">
              Si esta activa, la licencia queda reservada para el titular segun el alcance elegido.
            </p>
            <select
              className="w-full rounded border border-jc-gray-100 px-3 py-2"
              value={exclusiveScope}
              onChange={(e) =>
                setExclusiveScope(e.target.value as "none" | "production" | "import" | "both")
              }
              disabled={!exclusive}
            >
              <option value="none">Sin exclusividad</option>
              <option value="production">Exclusiva en produccion</option>
              <option value="import">Exclusiva en importacion</option>
              <option value="both">Exclusiva total (produccion + importacion)</option>
            </select>
          </div>

          <div className="space-y-2 rounded border border-jc-gray-100 p-3 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <span className="font-medium">Terminos aceptados</span>
            </label>
            <input
              className="w-full rounded border border-jc-gray-100 px-3 py-2"
              placeholder="Notas internas (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !selectedCategoryId || !expirationDate}
          className="rounded bg-jc-black px-4 py-2 text-sm font-medium text-jc-white disabled:opacity-50"
        >
          {saving ? "Creando..." : "Crear licencia"}
        </button>
      </form>

      <div className="grid gap-3 rounded-xl border border-jc-gray-100 bg-jc-white p-4 md:grid-cols-2">
        <form onSubmit={(e) => void createCategory(e)} className="flex gap-2">
          <input
            className="w-full rounded border border-jc-gray-100 px-3 py-2"
            placeholder="Nuevo rubro/subrubro (ej: marroquineria/carteras)"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <button
            type="submit"
            className="rounded border border-jc-gray-200 px-3 py-2 text-sm font-medium"
          >
            Crear
          </button>
        </form>
        <form
          onSubmit={(e) => void createTier(e)}
          className="grid grid-cols-[1fr_140px_170px_auto] gap-2"
        >
          <input
            className="rounded border border-jc-gray-100 px-3 py-2"
            placeholder="Nuevo plan (ej: Premium)"
            value={newTierName}
            onChange={(e) => setNewTierName(e.target.value)}
          />
          <input
            className="rounded border border-jc-gray-100 px-3 py-2"
            type="number"
            step="0.01"
            placeholder="Precio base"
            value={newTierBasePrice}
            onChange={(e) => setNewTierBasePrice(e.target.value)}
          />
          <input
            className="rounded border border-jc-gray-100 px-3 py-2"
            type="number"
            step="0.01"
            placeholder="Multiplicador excl."
            value={newTierExclusiveMultiplier}
            onChange={(e) => setNewTierExclusiveMultiplier(e.target.value)}
          />
          <button
            type="submit"
            className="rounded border border-jc-gray-200 px-3 py-2 text-sm font-medium"
          >
            Crear
          </button>
        </form>
        <p className="text-xs text-jc-gray-500 md:col-span-2">
          Precio base = valor sin exclusividad. Multiplicador de exclusividad: por ejemplo, 1.25
          significa +25%.
        </p>
      </div>

      {error ? <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-jc-gray-100 bg-jc-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-jc-gray-100 bg-jc-gray-50 text-left">
              <th className="px-3 py-2">Licenciatario</th>
              <th className="px-3 py-2">Categoría</th>
              <th className="px-3 py-2">Plan</th>
              <th className="px-3 py-2">Exclusividad</th>
              <th className="px-3 py-2">Precio acordado</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Inicio</th>
              <th className="px-3 py-2">Vencimiento</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-3" colSpan={9}>
                  Cargando...
                </td>
              </tr>
            ) : (
              licenses.map((l) => (
                <tr key={l.id} className="border-b border-jc-gray-100">
                  <td className="px-3 py-2">
                    {l.licenciatario_id == null
                      ? "Sin titular"
                      : (licenciatarioById.get(l.licenciatario_id)?.razon_social ?? "—")}
                  </td>
                  <td className="px-3 py-2">{l.category_name ?? l.category}</td>
                  <td className="px-3 py-2">{l.tier_name ?? "-"}</td>
                  <td className="px-3 py-2">{exclusivityLabel(l.exclusive, l.exclusive_scope)}</td>
                  <td className="px-3 py-2">{formatMoney(l.agreed_price)}</td>
                  <td className="px-3 py-2">{l.status}</td>
                  <td className="px-3 py-2">{formatDate(l.issue_date)}</td>
                  <td className="px-3 py-2">{formatDate(l.expiration_date)}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        className="rounded border border-jc-gray-200 px-2 py-1 text-xs"
                        onClick={() => void changeStatus(l.id, "active")}
                      >
                        Activar
                      </button>
                      <button
                        type="button"
                        className="rounded border border-jc-gray-200 px-2 py-1 text-xs"
                        onClick={() => void changeStatus(l.id, "inactive")}
                      >
                        Inactivar
                      </button>
                      <button
                        type="button"
                        className="rounded border border-jc-gray-200 px-2 py-1 text-xs"
                        onClick={() => void changeStatus(l.id, "expired")}
                      >
                        Expirar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
