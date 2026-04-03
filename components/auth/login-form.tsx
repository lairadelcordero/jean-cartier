"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push(next.startsWith("/") ? next : "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="mx-auto max-w-sm space-y-4 p-6">
      <h1 className="text-lg font-semibold text-jc-black">Iniciar sesión</h1>
      {searchParams.get("error") === "auth" && (
        <p className="text-sm text-red-600">No se pudo completar la autenticación.</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <label className="block space-y-1">
        <span className="text-sm text-jc-gray-700">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border border-jc-gray-100 px-3 py-2 text-jc-black"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm text-jc-gray-700">Contraseña</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border border-jc-gray-100 px-3 py-2 text-jc-black"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded border border-jc-gray-900 bg-jc-black px-3 py-2 text-sm font-medium text-jc-white disabled:opacity-50"
      >
        {loading ? "Enviando…" : "Entrar"}
      </button>
      <p className="text-center text-sm text-jc-gray-500">
        <Link href={`/auth/signup?next=${encodeURIComponent(next)}`} className="underline">
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}
