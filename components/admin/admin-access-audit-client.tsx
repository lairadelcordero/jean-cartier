"use client";

import { useCallback, useEffect, useState } from "react";

type Licenciatario = { id: string; razon_social: string; rut_cuit: string };
type AccessLog = {
  id: string;
  timestamp: string;
  access_type: string;
  result: string;
  ip_address: string | null;
  user_agent: string | null;
  denial_reason: string | null;
  admin_notes: string | null;
};
type AccessSummary = {
  total_login_attempts: number;
  successful_logins: number;
  failed_login_attempts: number;
  most_active_date: string | null;
  most_active_hour: number;
  unique_ip_addresses: number;
  suspicious_activities: number;
};

export function AdminAccessAuditClient() {
  const [licenciatarios, setLicenciatarios] = useState<Licenciatario[]>([]);
  const [selectedLicenciatario, setSelectedLicenciatario] = useState("");
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [summary, setSummary] = useState<AccessSummary | null>(null);
  const [resultFilter, setResultFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  const loadData = useCallback(
    async (licenciatarioId: string) => {
      const resultQuery = resultFilter ? `&result=${resultFilter}` : "";
      const [logsRes, summaryRes] = await Promise.all([
        fetch(
          `/api/v1/admin/licenciatarios/${licenciatarioId}/access-logs?limit=100${resultQuery}`,
          {
            cache: "no-store",
          }
        ),
        fetch(`/api/v1/admin/licenciatarios/${licenciatarioId}/access-summary`, {
          cache: "no-store",
        }),
      ]);
      const logsBody = (await logsRes.json()) as { data?: AccessLog[]; error?: string };
      const summaryBody = (await summaryRes.json()) as AccessSummary & { error?: string };
      if (!logsRes.ok || !summaryRes.ok) {
        setError(logsBody.error ?? summaryBody.error ?? "No se pudo cargar audit logs");
        return;
      }
      setLogs(logsBody.data ?? []);
      setSummary(summaryBody);
    },
    [resultFilter]
  );

  useEffect(() => {
    void loadLicenciatarios();
  }, [loadLicenciatarios]);

  useEffect(() => {
    if (selectedLicenciatario) void loadData(selectedLicenciatario);
  }, [selectedLicenciatario, loadData]);

  return (
    <div className="space-y-4">
      {error ? <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-3 rounded-xl border border-jc-gray-100 bg-jc-white p-4 md:grid-cols-3">
        <select
          className="rounded border border-jc-gray-100 px-3 py-2"
          value={selectedLicenciatario}
          onChange={(e) => setSelectedLicenciatario(e.target.value)}
        >
          {licenciatarios.map((lic) => (
            <option key={lic.id} value={lic.id}>
              {lic.razon_social} ({lic.rut_cuit})
            </option>
          ))}
        </select>
        <select
          className="rounded border border-jc-gray-100 px-3 py-2"
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)}
        >
          <option value="">Todos los resultados</option>
          <option value="success">success</option>
          <option value="denied">denied</option>
          <option value="error">error</option>
        </select>
        <button
          type="button"
          onClick={() => selectedLicenciatario && void loadData(selectedLicenciatario)}
          className="rounded border border-jc-gray-200 px-3 py-2 text-sm font-medium hover:bg-jc-gray-50"
        >
          Aplicar filtros
        </button>
      </div>

      {summary ? (
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-jc-gray-100 bg-jc-white p-4">
            <p className="text-xs uppercase tracking-wide text-jc-gray-500">Login attempts</p>
            <p className="text-2xl font-semibold">{summary.total_login_attempts}</p>
          </div>
          <div className="rounded-xl border border-jc-gray-100 bg-jc-white p-4">
            <p className="text-xs uppercase tracking-wide text-jc-gray-500">Success / Failed</p>
            <p className="text-2xl font-semibold">
              {summary.successful_logins} / {summary.failed_login_attempts}
            </p>
          </div>
          <div className="rounded-xl border border-jc-gray-100 bg-jc-white p-4">
            <p className="text-xs uppercase tracking-wide text-jc-gray-500">IPs únicas</p>
            <p className="text-2xl font-semibold">{summary.unique_ip_addresses}</p>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-jc-gray-100 bg-jc-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-jc-gray-100 bg-jc-gray-50 text-left">
              <th className="px-3 py-2">Timestamp</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Result</th>
              <th className="px-3 py-2">IP</th>
              <th className="px-3 py-2">Denial reason</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-jc-gray-100">
                <td className="px-3 py-2">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-3 py-2">{log.access_type}</td>
                <td className="px-3 py-2">{log.result}</td>
                <td className="px-3 py-2">{log.ip_address ?? "-"}</td>
                <td className="px-3 py-2">{log.denial_reason ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
