"use client";

import type { UserRole } from "@/types/database";
import { useCallback, useEffect, useMemo, useState } from "react";

type AdminUser = {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
};

const roles: UserRole[] = ["customer", "licenciatario", "editor", "admin", "sudo"];

export function AdminUsersClient() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [saving, setSaving] = useState(false);
  const [roleDrafts, setRoleDrafts] = useState<Record<string, UserRole>>({});

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/users", { cache: "no-store" });
    const body = (await res.json()) as { data?: AdminUser[]; error?: string };
    if (!res.ok) {
      setError(body.error ?? "No se pudieron cargar usuarios");
      setLoading(false);
      return;
    }
    const rows = body.data ?? [];
    setUsers(rows);
    setRoleDrafts(Object.fromEntries(rows.map((u) => [u.id, u.role])));
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const ordered = useMemo(
    () => [...users].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [users]
  );

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(body.error ?? "No se pudo crear usuario");
      setSaving(false);
      return;
    }
    setEmail("");
    setPassword("");
    setRole("customer");
    await loadUsers();
    setSaving(false);
  }

  async function saveRole(userId: string) {
    const nextRole = roleDrafts[userId];
    if (!nextRole) return;
    setError(null);
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(body.error ?? "No se pudo actualizar rol");
      return;
    }
    await loadUsers();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => void createUser(e)}
        className="grid gap-3 rounded-xl border border-jc-gray-100 bg-jc-white p-4 md:grid-cols-4"
      >
        <input
          className="rounded border border-jc-gray-100 px-3 py-2"
          placeholder="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="rounded border border-jc-gray-100 px-3 py-2"
          placeholder="Password temporal (mín 8)"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          className="rounded border border-jc-gray-100 px-3 py-2"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-jc-black px-4 py-2 text-sm font-medium text-jc-white disabled:opacity-50"
        >
          {saving ? "Creando..." : "Crear usuario"}
        </button>
      </form>

      {error ? <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-jc-gray-100 bg-jc-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-jc-gray-100 bg-jc-gray-50 text-left">
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Rol</th>
              <th className="px-3 py-2">Alta</th>
              <th className="px-3 py-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-3" colSpan={4}>
                  Cargando...
                </td>
              </tr>
            ) : (
              ordered.map((u) => (
                <tr key={u.id} className="border-b border-jc-gray-100">
                  <td className="px-3 py-2">
                    <div>{u.email}</div>
                    <div className="font-mono text-xs text-jc-gray-500">{u.id}</div>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      className="rounded border border-jc-gray-100 px-2 py-1"
                      value={roleDrafts[u.id] ?? u.role}
                      onChange={(e) =>
                        setRoleDrafts((prev) => ({ ...prev, [u.id]: e.target.value as UserRole }))
                      }
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">{new Date(u.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => void saveRole(u.id)}
                      className="rounded border border-jc-gray-200 px-2 py-1 font-medium hover:bg-jc-gray-50"
                    >
                      Guardar rol
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
