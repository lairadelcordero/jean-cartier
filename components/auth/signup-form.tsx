"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function SignupForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const safeNext = next.startsWith("/") ? next : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const supabase = createClient();
    const origin = window.location.origin;
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/api/auth/callback?next=${encodeURIComponent(safeNext)}`,
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setMessage("Revisá tu correo para confirmar la cuenta (si está habilitada la verificación).");
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="mx-auto max-w-sm space-y-4 p-6">
      <h1 className="text-lg font-semibold text-jc-black">Registro</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-jc-gray-700">{message}</p>}
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
          autoComplete="new-password"
          required
          minLength={6}
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
        {loading ? "Enviando…" : "Registrarse"}
      </button>
      <p className="text-center text-sm text-jc-gray-500">
        <Link href={`/auth/login?next=${encodeURIComponent(safeNext)}`} className="underline">
          Ya tengo cuenta
        </Link>
      </p>
    </form>
  );
}
