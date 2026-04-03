"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LicenciatarioHeader({ email }: { email: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setLoading(false);
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <header className="border-b border-jc-gray-100 bg-gradient-surface shadow-jc">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <Link
          href="/licenciatario/dashboard"
          className="font-sans text-lg font-heading tracking-menu text-jc-gold transition hover:text-jc-black"
        >
          JEAN CARTIER
        </Link>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="text-sm text-jc-gray-700">{email}</span>
          <button
            type="button"
            disabled={loading}
            onClick={() => void onLogout()}
            className="rounded border border-jc-gray-100 bg-jc-gray-50 px-4 py-2 text-sm font-medium text-jc-black transition hover:bg-jc-gray-100 disabled:opacity-50"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
