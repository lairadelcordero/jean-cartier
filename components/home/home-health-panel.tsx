"use client";

import { useCallback, useEffect, useState } from "react";

type ReqHealthOk = {
  status: "ok";
  database: "connected";
  mercadopago: "connected";
  timestamp: string;
};

type ReqHealthErr = {
  status: "error";
  database: "connected" | "disconnected";
  mercadopago: "connected" | "disconnected";
  error: string;
  timestamp: string;
};

type HealthPayload = ReqHealthOk | ReqHealthErr;

type DisplayStatus = "healthy" | "error" | "checking";

function connectionToDisplay(status: "connected" | "disconnected"): DisplayStatus {
  return status === "connected" ? "healthy" : "error";
}

function StatusBadge({ status }: { status: DisplayStatus }) {
  const colors: Record<DisplayStatus, string> = {
    healthy: "border-jc-gold/40 bg-jc-gray-50 text-jc-gray-900",
    error: "border-jc-gray-300 bg-jc-gray-100 text-jc-black",
    checking: "border-jc-gray-100 bg-jc-white text-jc-gray-500",
  };
  const labels: Record<DisplayStatus, string> = {
    healthy: "Operacional",
    error: "Error",
    checking: "Verificando…",
  };
  const dots: Record<DisplayStatus, string> = {
    healthy: "bg-jc-gold",
    error: "bg-jc-black",
    checking: "bg-jc-gray-300",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-medium font-inter ${colors[status]}`}
    >
      <span className={`h-2 w-2 rounded-full ${dots[status]}`} aria-hidden />
      {labels[status]}
    </span>
  );
}

function EnvBadge({ env }: { env: string }) {
  const colors: Record<string, string> = {
    production: "border-jc-gray-300 bg-jc-gray-100 text-jc-black",
    staging: "border-jc-gray-100 bg-jc-gray-50 text-jc-gray-700",
    development: "border-jc-gray-100 bg-jc-white text-jc-gray-500",
  };
  const color = colors[env] ?? colors.development;
  return (
    <span
      className={`rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-wide font-inter ${color}`}
    >
      {env}
    </span>
  );
}

export function HomeHealthPanel({ appEnv }: { appEnv: string }) {
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health");
      const data: HealthPayload = await res.json();
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

  const dbDisplay =
    health && health.status === "ok"
      ? connectionToDisplay(health.database)
      : health?.status === "error"
        ? connectionToDisplay(health.database)
        : null;
  const mpDisplay =
    health && health.status === "ok"
      ? connectionToDisplay(health.mercadopago)
      : health?.status === "error"
        ? connectionToDisplay(health.mercadopago)
        : null;

  return (
    <>
      <p className="mb-4 text-lead font-medium text-jc-gold font-inter">
        Plataforma de Licencias &amp; Marketplace
      </p>
      <EnvBadge env={appEnv} />

      <section
        className="mt-12 w-full max-w-lg rounded-brand border border-jc-gray-100 bg-gradient-surface p-6 shadow-jc"
        aria-labelledby="estado-sistema-heading"
        aria-live="polite"
        aria-busy={loading}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="estado-sistema-heading"
            className="text-menu font-semibold uppercase tracking-ribbon text-jc-gray-500 font-inter"
          >
            Estado del Sistema
          </h2>
          <button
            type="button"
            onClick={fetchHealth}
            disabled={loading}
            className="rounded-brand border border-jc-gray-100 bg-jc-white px-3 py-1 text-nav font-semibold uppercase tracking-ribbon text-jc-gray-500 transition-colors hover:bg-jc-gray-50 disabled:opacity-40 font-inter"
          >
            {loading ? "Verificando…" : "Actualizar"}
          </button>
        </div>

        {loading && !health ? (
          <p className="py-4 text-center text-sm text-jc-gray-500 font-inter">
            Verificando componentes…
          </p>
        ) : health ? (
          <>
            <ul className="divide-y divide-jc-gray-100">
              <li className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-jc-black">Base de Datos</p>
                  {health.status === "error" && health.database === "disconnected" && (
                    <p className="mt-0.5 max-w-xs text-xs text-jc-gray-700 font-inter">
                      {health.error}
                    </p>
                  )}
                </div>
                {dbDisplay && <StatusBadge status={dbDisplay} />}
              </li>
              <li className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-jc-black">Mercado Pago</p>
                  {health.status === "error" && health.mercadopago === "disconnected" && (
                    <p className="mt-0.5 max-w-xs text-xs text-jc-gray-700 font-inter">
                      {health.error}
                    </p>
                  )}
                </div>
                {mpDisplay && <StatusBadge status={mpDisplay} />}
              </li>
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-jc-gray-100 pt-3">
              <p className="text-xs text-jc-gray-500 font-inter">
                Última verificación: {new Date(health.timestamp).toLocaleTimeString("es-AR")}
              </p>
              <StatusBadge status={health.status === "ok" ? "healthy" : "error"} />
            </div>
          </>
        ) : (
          <p className="py-4 text-center text-sm text-jc-gray-700 font-inter">
            No se pudo obtener el estado del sistema.
          </p>
        )}
      </section>
    </>
  );
}
