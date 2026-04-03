"use client";

import { useCallback, useEffect, useState } from "react";

type ComponentStatus = {
  status: "healthy" | "error" | "checking";
  latency_ms?: number;
  error?: string;
};

type HealthData = {
  status: "healthy" | "degraded";
  timestamp: string;
  environment: string;
  components: {
    database: ComponentStatus;
    mercado_pago: ComponentStatus;
  };
};

function StatusBadge({ status }: { status: ComponentStatus["status"] }) {
  const colors: Record<ComponentStatus["status"], string> = {
    healthy: "bg-green-100 text-green-800 border-green-200",
    error: "bg-red-100 text-red-800 border-red-200",
    checking: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };
  const labels: Record<ComponentStatus["status"], string> = {
    healthy: "Operacional",
    error: "Error",
    checking: "Verificando…",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-medium ${colors[status]}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          status === "healthy"
            ? "bg-green-500"
            : status === "error"
              ? "bg-red-500"
              : "bg-yellow-500"
        }`}
        aria-hidden
      />
      {labels[status]}
    </span>
  );
}

function EnvBadge({ env }: { env: string }) {
  const colors: Record<string, string> = {
    production: "bg-blue-100 text-blue-800 border-blue-200",
    staging: "bg-purple-100 text-purple-800 border-purple-200",
    development: "bg-gray-100 text-gray-700 border-gray-200",
  };
  const color = colors[env] ?? colors.development;
  return (
    <span
      className={`rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-wide ${color}`}
    >
      {env}
    </span>
  );
}

export function HomeHealthPanel({ appEnv }: { appEnv: string }) {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health");
      const data: HealthData = await res.json();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchHealth();
  }, [fetchHealth]);

  return (
    <>
      <p className="mb-4 text-lead font-medium text-accent">
        Plataforma de Licencias &amp; Marketplace
      </p>
      <EnvBadge env={appEnv} />

      <section
        className="mt-12 w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        aria-labelledby="estado-sistema-heading"
        aria-live="polite"
        aria-busy={loading}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="estado-sistema-heading"
            className="text-menu font-semibold uppercase tracking-ribbon text-primary/55"
          >
            Estado del Sistema
          </h2>
          <button
            type="button"
            onClick={fetchHealth}
            disabled={loading}
            className="rounded-lg border border-gray-200 px-3 py-1 text-nav font-semibold uppercase tracking-ribbon text-primary/70 transition-colors hover:bg-gray-50 disabled:opacity-40"
          >
            {loading ? "Verificando…" : "Actualizar"}
          </button>
        </div>

        {loading && !health ? (
          <p className="py-4 text-center text-sm text-gray-400">Verificando componentes…</p>
        ) : health ? (
          <>
            <ul className="divide-y divide-gray-100">
              <li className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">Base de Datos</p>
                  {health.components.database.latency_ms !== undefined && (
                    <p className="text-xs text-gray-400">
                      {health.components.database.latency_ms} ms
                    </p>
                  )}
                  {health.components.database.error && (
                    <p className="mt-0.5 max-w-xs truncate text-xs text-red-500">
                      {health.components.database.error}
                    </p>
                  )}
                </div>
                <StatusBadge status={health.components.database.status} />
              </li>
              <li className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">Mercado Pago</p>
                  {health.components.mercado_pago.latency_ms !== undefined && (
                    <p className="text-xs text-gray-400">
                      {health.components.mercado_pago.latency_ms} ms
                    </p>
                  )}
                  {health.components.mercado_pago.error && (
                    <p className="mt-0.5 max-w-xs truncate text-xs text-red-500">
                      {health.components.mercado_pago.error}
                    </p>
                  )}
                </div>
                <StatusBadge status={health.components.mercado_pago.status} />
              </li>
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-400">
                Última verificación: {new Date(health.timestamp).toLocaleTimeString("es-AR")}
              </p>
              <StatusBadge status={health.status === "healthy" ? "healthy" : "error"} />
            </div>
          </>
        ) : (
          <p className="py-4 text-center text-sm text-red-500">
            No se pudo obtener el estado del sistema.
          </p>
        )}
      </section>
    </>
  );
}
