"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminHeader({ email, role }: { email: string; role: string }) {
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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div>
          <p className="font-sans text-lg font-heading tracking-menu text-jc-gold">
            JEAN CARTIER · ADMIN
          </p>
          <p className="text-xs text-jc-gray-700">Backoffice licenciatarios</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="rounded bg-jc-gray-100 px-2 py-1 font-medium uppercase tracking-wide">
            {role}
          </span>
          <span className="text-jc-gray-700">{email}</span>
          <button
            type="button"
            onClick={() => void onLogout()}
            disabled={loading}
            className="rounded border border-jc-gray-100 bg-jc-gray-50 px-3 py-1.5 font-medium text-jc-black disabled:opacity-50"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
