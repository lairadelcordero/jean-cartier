"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type ListItem = {
  id: string;
  razon_social: string;
  rut_cuit: string;
  status: "active" | "inactive" | "pending";
  primary_category: string | null;
  license_expiration_date: string | null;
  payment_status: "current" | "overdue";
  last_modified_date: string;
};

type Detail = {
  id: string;
  legal_data: {
    razon_social: string;
    rut_cuit: string;
    domicilio: string;
    tipo_entidad: string;
  };
  fiscal_data: {
    regimen_tributario: string;
    numero_inscripcion: string | null;
    actividad_principal: string;
  };
  contact_data: {
    primary_contact: { name: string; email: string; phone: string };
    secondary_contact: { name: string; email: string; phone: string } | null;
  };
  status: "active" | "inactive" | "pending";
};

type HistoryItem = {
  id: string;
  timestamp: string;
  admin_name: string | null;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  change_type: string;
};

const emptyCreate = {
  razon_social: "",
  rut_cuit: "",
  domicilio: "",
  tipo_entidad: "empresa",
  regimen_tributario: "responsable_inscripto",
  numero_inscripcion: "",
  actividad_principal: "",
  primary_contact: { name: "", email: "", phone: "" },
  secondary_contact: { name: "", email: "", phone: "" },
};

function asOptional(value: string) {
  return value.trim() ? value : "No informado";
}

export function AdminLicenciatariosClient() {
  const [rows, setRows] = useState<ListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [createDraft, setCreateDraft] = useState(emptyCreate);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pageSize, setPageSize] = useState(50);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (statusFilter) params.set("status", statusFilter);
    params.set("limit", String(pageSize));
    return params.toString();
  }, [search, statusFilter, pageSize]);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/v1/admin/licenciatarios?${query}`, { cache: "no-store" });
    const body = (await res.json()) as { data?: ListItem[]; error?: string };
    if (!res.ok) {
      setError(body.error ?? "No se pudo cargar licenciatarios");
      setLoading(false);
      return;
    }
    const next = body.data ?? [];
    setRows(next);
    if (!selectedId && next.length > 0) setSelectedId(next[0].id);
    setLoading(false);
  }, [query, selectedId]);

  const loadDetail = useCallback(async (id: string) => {
    const [detailRes, historyRes] = await Promise.all([
      fetch(`/api/v1/admin/licenciatarios/${id}`, { cache: "no-store" }),
      fetch(`/api/v1/admin/licenciatarios/${id}/change-history?limit=20`, { cache: "no-store" }),
    ]);
    const detailBody = (await detailRes.json()) as Detail & { error?: string };
    const historyBody = (await historyRes.json()) as { data?: HistoryItem[]; error?: string };
    if (!detailRes.ok || !historyRes.ok) {
      setError(detailBody.error ?? historyBody.error ?? "No se pudo cargar detalle");
      return;
    }
    setDetail(detailBody);
    setHistory(historyBody.data ?? []);
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (selectedId) void loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  async function createLicenciatario(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/v1/admin/licenciatarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...createDraft,
        numero_inscripcion: createDraft.numero_inscripcion || null,
        secondary_contact:
          createDraft.secondary_contact.name &&
          createDraft.secondary_contact.email &&
          createDraft.secondary_contact.phone
            ? createDraft.secondary_contact
            : null,
      }),
    });
    const body = (await res.json()) as { error?: string; id?: string };
    if (!res.ok) {
      setError(body.error ?? "No se pudo crear licenciatario");
      setSaving(false);
      return;
    }
    setCreateDraft(emptyCreate);
    await loadList();
    if (body.id) setSelectedId(body.id);
    setSaving(false);
  }

  async function archiveSelected() {
    if (!detail) return;
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/v1/admin/licenciatarios/${detail.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "inactive" }),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(body.error ?? "No se pudo archivar");
      setSaving(false);
      return;
    }
    await Promise.all([loadList(), loadDetail(detail.id)]);
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      {error ? <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <form
        onSubmit={(e) => void createLicenciatario(e)}
        className="space-y-4 rounded-xl border border-jc-gray-100 bg-jc-white p-4"
      >
        <div>
          <h3 className="text-base font-semibold">Alta rapida de licenciatario</h3>
          <p className="text-sm text-jc-gray-600">
            Todos los campos son opcionales. Podras completar la ficha despues.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <fieldset className="space-y-3 rounded-lg border border-jc-gray-100 p-3">
            <legend className="px-1 text-sm font-medium">Datos legales</legend>
            <label className="block text-sm">
              <span className="mb-1 block text-jc-gray-700">Razon social</span>
              <input
                className="w-full rounded border border-jc-gray-100 px-3 py-2"
                placeholder="Ej: Grupo Nathan"
                value={createDraft.razon_social}
                onChange={(e) =>
                  setCreateDraft((prev) => ({ ...prev, razon_social: e.target.value }))
                }
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-jc-gray-700">CUIT</span>
              <input
                className="w-full rounded border border-jc-gray-100 px-3 py-2"
                placeholder="Opcional en alta rapida"
                value={createDraft.rut_cuit}
                onChange={(e) => setCreateDraft((prev) => ({ ...prev, rut_cuit: e.target.value }))}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-jc-gray-700">Domicilio</span>
              <input
                className="w-full rounded border border-jc-gray-100 px-3 py-2"
                value={createDraft.domicilio}
                onChange={(e) => setCreateDraft((prev) => ({ ...prev, domicilio: e.target.value }))}
              />
            </label>
          </fieldset>

          <fieldset className="space-y-3 rounded-lg border border-jc-gray-100 p-3">
            <legend className="px-1 text-sm font-medium">Contacto principal</legend>
            <label className="block text-sm">
              <span className="mb-1 block text-jc-gray-700">Nombre</span>
              <input
                className="w-full rounded border border-jc-gray-100 px-3 py-2"
                value={createDraft.primary_contact.name}
                onChange={(e) =>
                  setCreateDraft((prev) => ({
                    ...prev,
                    primary_contact: { ...prev.primary_contact, name: e.target.value },
                  }))
                }
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-jc-gray-700">Email</span>
              <input
                className="w-full rounded border border-jc-gray-100 px-3 py-2"
                type="email"
                value={createDraft.primary_contact.email}
                onChange={(e) =>
                  setCreateDraft((prev) => ({
                    ...prev,
                    primary_contact: { ...prev.primary_contact, email: e.target.value },
                  }))
                }
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-jc-gray-700">Telefono</span>
              <input
                className="w-full rounded border border-jc-gray-100 px-3 py-2"
                value={createDraft.primary_contact.phone}
                onChange={(e) =>
                  setCreateDraft((prev) => ({
                    ...prev,
                    primary_contact: { ...prev.primary_contact, phone: e.target.value },
                  }))
                }
              />
            </label>
          </fieldset>
        </div>

        <details className="rounded-lg border border-jc-gray-100 p-3">
          <summary className="cursor-pointer text-sm font-medium">
            Campos avanzados (opcionales)
          </summary>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <label className="block text-sm">
              <span className="mb-1 block text-jc-gray-700">Tipo de entidad</span>
              <input
                className="w-full rounded border border-jc-gray-100 px-3 py-2"
                value={createDraft.tipo_entidad}
                onChange={(e) =>
                  setCreateDraft((prev) => ({ ...prev, tipo_entidad: e.target.value }))
                }
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-jc-gray-700">Regimen tributario</span>
              <input
                className="w-full rounded border border-jc-gray-100 px-3 py-2"
                value={createDraft.regimen_tributario}
                onChange={(e) =>
                  setCreateDraft((prev) => ({ ...prev, regimen_tributario: e.target.value }))
                }
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-jc-gray-700">Actividad principal</span>
              <input
                className="w-full rounded border border-jc-gray-100 px-3 py-2"
                value={createDraft.actividad_principal}
                onChange={(e) =>
                  setCreateDraft((prev) => ({ ...prev, actividad_principal: e.target.value }))
                }
              />
            </label>
          </div>
        </details>

        <button
          type="submit"
          disabled={saving}
          className="rounded bg-jc-black px-4 py-2 text-sm font-medium text-jc-white disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Crear licenciatario"}
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3 rounded-xl border border-jc-gray-100 bg-jc-white p-4">
          <div className="grid gap-2 md:grid-cols-3">
            <input
              className="rounded border border-jc-gray-100 px-3 py-2"
              placeholder="Buscar por nombre o RUT/CUIT"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="rounded border border-jc-gray-100 px-3 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="pending">pending</option>
            </select>
            <select
              className="rounded border border-jc-gray-100 px-3 py-2"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
          <div className="flex justify-end">
            <a
              href={`/api/v1/admin/licenciatarios?${query}&export=csv`}
              className="rounded border border-jc-gray-200 px-3 py-1.5 text-xs font-medium hover:bg-jc-gray-50"
            >
              Exportar CSV
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-jc-gray-100 bg-jc-gray-50 text-left">
                  <th className="px-3 py-2">Razón social</th>
                  <th className="px-3 py-2">CUIT</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Categoría</th>
                  <th className="px-3 py-2">Vence</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-3 py-3" colSpan={5}>
                      Cargando...
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.id}
                      className={`cursor-pointer border-b border-jc-gray-100 ${
                        selectedId === row.id ? "bg-jc-gray-50" : ""
                      }`}
                      tabIndex={0}
                      onClick={() => setSelectedId(row.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedId(row.id);
                        }
                      }}
                    >
                      <td className="px-3 py-2">{row.razon_social}</td>
                      <td className="px-3 py-2">{row.rut_cuit}</td>
                      <td className="px-3 py-2">
                        {row.status === "pending"
                          ? "Pendiente"
                          : row.status === "active"
                            ? "Activo"
                            : "Inactivo"}
                      </td>
                      <td className="px-3 py-2">{row.primary_category ?? "-"}</td>
                      <td className="px-3 py-2">{row.license_expiration_date ?? "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-jc-gray-100 bg-jc-white p-4">
          <h3 className="text-base font-semibold">Detalle y auditoría</h3>
          {detail ? (
            <>
              <p className="text-sm">
                <span className="font-medium">Razón social:</span> {detail.legal_data.razon_social}
              </p>
              <p className="text-sm">
                <span className="font-medium">CUIT:</span> {detail.legal_data.rut_cuit}
              </p>
              <p className="text-sm">
                <span className="font-medium">Domicilio:</span> {detail.legal_data.domicilio}
              </p>
              <p className="text-sm">
                <span className="font-medium">Contacto:</span>{" "}
                {asOptional(detail.contact_data.primary_contact.name)} /{" "}
                {asOptional(detail.contact_data.primary_contact.email)}
              </p>
              <button
                type="button"
                disabled={saving}
                onClick={() => void archiveSelected()}
                className="rounded border border-jc-gray-200 px-3 py-1.5 text-sm font-medium hover:bg-jc-gray-50 disabled:opacity-50"
              >
                Archivar (status inactive)
              </button>
              <div className="max-h-56 space-y-2 overflow-y-auto rounded border border-jc-gray-100 p-2 text-xs">
                {history.map((item) => (
                  <div key={item.id} className="rounded bg-jc-gray-50 p-2">
                    <p className="font-medium">
                      {item.field_name} · {item.change_type}
                    </p>
                    <p>{new Date(item.timestamp).toLocaleString()}</p>
                    <p>{item.admin_name ?? "admin"}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-jc-gray-700">Seleccioná un licenciatario.</p>
          )}
        </div>
      </div>
    </div>
  );
}
