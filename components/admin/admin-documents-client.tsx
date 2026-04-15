"use client";

import { useCallback, useEffect, useState } from "react";

type DocRow = {
  id: string;
  file_name: string;
  document_type: string;
  file_size: number;
  upload_date: string;
  uploaded_by_name: string | null;
  description: string | null;
  version: number;
  is_current: boolean;
};
type UserRow = { id: string; razon_social: string; rut_cuit: string };

export function AdminDocumentsClient() {
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedLicenciatario, setSelectedLicenciatario] = useState("");
  const [form, setForm] = useState({
    document_type: "other",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const loadData = useCallback(async () => {
    const usersRes = await fetch("/api/v1/admin/licenciatarios?limit=200", { cache: "no-store" });
    const usersBody = (await usersRes.json()) as { data?: UserRow[]; error?: string };
    if (!usersRes.ok) {
      setError(usersBody.error ?? "No se pudo cargar licenciatarios");
      return;
    }
    const licenciatarios = usersBody.data ?? [];
    setUsers(licenciatarios);
    if (!selectedLicenciatario && licenciatarios.length > 0) {
      setSelectedLicenciatario(licenciatarios[0].id);
    }
  }, [selectedLicenciatario]);

  const loadDocs = useCallback(async (licenciatarioId: string) => {
    const docsRes = await fetch(`/api/v1/admin/licenciatarios/${licenciatarioId}/documents`, {
      cache: "no-store",
    });
    const docsBody = (await docsRes.json()) as { data?: DocRow[]; error?: string };
    if (!docsRes.ok) {
      setError(docsBody.error ?? "No se pudo cargar documentación");
      return;
    }
    setDocs(docsBody.data ?? []);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedLicenciatario) void loadDocs(selectedLicenciatario);
  }, [selectedLicenciatario, loadDocs]);

  async function createDoc(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLicenciatario || !file) {
      setError("Seleccioná licenciatario y archivo");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = new FormData();
    payload.set("file", file);
    payload.set("document_type", form.document_type);
    payload.set("description", form.description);
    const res = await fetch(`/api/v1/admin/licenciatarios/${selectedLicenciatario}/documents`, {
      method: "POST",
      body: payload,
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(body.error ?? "No se pudo crear documento");
      setSaving(false);
      return;
    }
    setForm((prev) => ({ ...prev, description: "" }));
    setFile(null);
    await loadDocs(selectedLicenciatario);
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => void createDoc(e)}
        className="grid gap-3 rounded-xl border border-jc-gray-100 bg-jc-white p-4 md:grid-cols-3"
      >
        <select
          className="rounded border border-jc-gray-100 px-3 py-2"
          value={selectedLicenciatario}
          onChange={(e) => setSelectedLicenciatario(e.target.value)}
          required
        >
          <option value="" disabled>
            Licenciatario
          </option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.razon_social} ({u.rut_cuit})
            </option>
          ))}
        </select>
        <select
          className="rounded border border-jc-gray-100 px-3 py-2"
          value={form.document_type}
          onChange={(e) => setForm((prev) => ({ ...prev, document_type: e.target.value }))}
        >
          <option value="contract">contract</option>
          <option value="terms">terms</option>
          <option value="compliance">compliance</option>
          <option value="other">other</option>
        </select>
        <input
          className="rounded border border-jc-gray-100 px-3 py-2"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
        />
        <input
          className="rounded border border-jc-gray-100 px-3 py-2 md:col-span-3"
          placeholder="Descripción"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        />
        <button
          type="submit"
          disabled={saving}
          className="md:col-span-3 rounded bg-jc-black px-4 py-2 text-sm font-medium text-jc-white disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Crear documento"}
        </button>
      </form>

      {error ? <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-jc-gray-100 bg-jc-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-jc-gray-100 bg-jc-gray-50 text-left">
              <th className="px-3 py-2">Archivo</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Tamaño</th>
              <th className="px-3 py-2">Versión</th>
              <th className="px-3 py-2">Subido por</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id} className="border-b border-jc-gray-100">
                <td className="px-3 py-2">
                  <div>{d.file_name}</div>
                  <div className="font-mono text-xs text-jc-gray-500">
                    {new Date(d.upload_date).toLocaleString()}
                  </div>
                </td>
                <td className="px-3 py-2">{d.document_type}</td>
                <td className="px-3 py-2">{(d.file_size / 1024 / 1024).toFixed(2)} MB</td>
                <td className="px-3 py-2">
                  v{d.version} {d.is_current ? "(current)" : ""}
                </td>
                <td className="px-3 py-2">{d.uploaded_by_name ?? "-"}</td>
                <td className="px-3 py-2">
                  <a
                    href={`/api/v1/admin/licenciatarios/${selectedLicenciatario}/documents/${d.id}/download`}
                    className="text-jc-gold underline"
                  >
                    download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
