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
    healthy: "border-jc-g3 bg-jc-g1 text-jc-g6",
    error: "border-jc-g5 bg-jc-g2 text-jc-black",
    checking: "border-jc-g3 bg-jc-white text-jc-g5",
  };
  const labels: Record<ComponentStatus["status"], string> = {
    healthy: "Operacional",
    error: "Error",
    checking: "Verificando…",
  };
  const dots: Record<ComponentStatus["status"], string> = {
    healthy: "bg-jc-g5",
    error: "bg-jc-black",
    checking: "bg-jc-g4",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-medium ${colors[status]}`}
    >
      <span className={`h-2 w-2 rounded-full ${dots[status]}`} aria-hidden />
      {labels[status]}
    </span>
  );
}

function EnvBadge({ env }: { env: string }) {
  const colors: Record<string, string> = {
    production: "border-jc-g4 bg-jc-g2 text-jc-black",
    staging: "border-jc-g3 bg-jc-g1 text-jc-g6",
    development: "border-jc-g3 bg-jc-white text-jc-g5",
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
      <p className="mb-4 text-lead font-medium text-jc-g5">
        Plataforma de Licencias &amp; Marketplace
      </p>
      <EnvBadge env={appEnv} />

      <section
        className="mt-12 w-full max-w-lg rounded-2xl border border-jc-g2 bg-gradient-surface p-6 shadow-jc"
        aria-labelledby="estado-sistema-heading"
        aria-live="polite"
        aria-busy={loading}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="estado-sistema-heading"
            className="text-menu font-semibold uppercase tracking-ribbon text-jc-g4"
          >
            Estado del Sistema
          </h2>
          <button
            type="button"
            onClick={fetchHealth}
            disabled={loading}
            className="rounded-lg border border-jc-g2 bg-jc-white px-3 py-1 text-nav font-semibold uppercase tracking-ribbon text-jc-g5 transition-colors hover:bg-jc-g1 disabled:opacity-40"
          >
            {loading ? "Verificando…" : "Actualizar"}
          </button>
        </div>

        {loading && !health ? (
          <p className="py-4 text-center text-sm text-jc-g4">Verificando componentes…</p>
        ) : health ? (
          <>
            <ul className="divide-y divide-jc-g2">
              <li className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-jc-black">Base de Datos</p>
                  {health.components.database.latency_ms !== undefined && (
                    <p className="text-xs text-jc-g4">{health.components.database.latency_ms} ms</p>
                  )}
                  {health.components.database.error && (
                    <p className="mt-0.5 max-w-xs truncate text-xs text-jc-g6">
                      {health.components.database.error}
                    </p>
                  )}
                </div>
                <StatusBadge status={health.components.database.status} />
              </li>
              <li className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-jc-black">Mercado Pago</p>
                  {health.components.mercado_pago.latency_ms !== undefined && (
                    <p className="text-xs text-jc-g4">
                      {health.components.mercado_pago.latency_ms} ms
                    </p>
                  )}
                  {health.components.mercado_pago.error && (
                    <p className="mt-0.5 max-w-xs truncate text-xs text-jc-g6">
                      {health.components.mercado_pago.error}
                    </p>
                  )}
                </div>
                <StatusBadge status={health.components.mercado_pago.status} />
              </li>
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-jc-g2 pt-3">
              <p className="text-xs text-jc-g4">
                Última verificación: {new Date(health.timestamp).toLocaleTimeString("es-AR")}
              </p>
              <StatusBadge status={health.status === "healthy" ? "healthy" : "error"} />
            </div>
          </>
        ) : (
          <p className="py-4 text-center text-sm text-jc-g6">
            No se pudo obtener el estado del sistema.
          </p>
        )}
      </section>
    </>
  );
}
