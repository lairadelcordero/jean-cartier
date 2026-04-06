import { createClient } from "@/lib/supabase/server";

const box =
  "mb-8 max-w-lg rounded-lg border border-jc-gray-200 bg-jc-white/80 px-4 py-3 text-left text-sm text-jc-gray-600 shadow-sm";

/**
 * Solo desarrollo: explica por qué el portal denegó el acceso (sesión, fila en users, rol).
 */
export async function AccessDeniedDevHint() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className={box}>
        <p className="mb-2">
          <strong className="font-medium text-jc-black">Diagnóstico (dev):</strong> no hay sesión
          activa. Iniciá sesión y volvé a abrir{" "}
          <code className="text-xs">/licenciatario/dashboard</code>.
        </p>
      </div>
    );
  }

  const { data: row, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return (
      <div className={box}>
        <p className="mb-2">
          <strong className="font-medium text-jc-black">Diagnóstico (dev):</strong> no se pudo leer{" "}
          <code className="text-xs">public.users</code>: {error.message}
        </p>
        <p>
          Suele faltar la tabla o migraciones en el proyecto de Supabase de tu{" "}
          <code className="text-xs">.env.local</code>. Ver{" "}
          <code className="text-xs">docs/guia-licenciatario-supabase.md</code> → «Esquema en la
          nube».
        </p>
      </div>
    );
  }

  if (!row) {
    const mail = user.email ?? "tu@email.com";
    return (
      <div className={box}>
        <p className="mb-2">
          <strong className="font-medium text-jc-black">Diagnóstico (dev):</strong> iniciaste sesión
          como <code className="text-xs">{user.email}</code> pero no hay fila en{" "}
          <code className="text-xs">public.users</code> con tu id.
        </p>
        <p className="mb-2 font-mono text-xs break-all text-jc-gray-700">id: {user.id}</p>
        <p>
          Aplicá migraciones y después:{" "}
          <code className="text-xs">pnpm promote:licenciatario {mail}</code> (con{" "}
          <code className="text-xs">SUPABASE_SERVICE_ROLE_KEY</code> real). Cerrá sesión y volvé a
          entrar.
        </p>
      </div>
    );
  }

  if (row.role !== "licenciatario") {
    const mail = user.email ?? "tu@email.com";
    return (
      <div className={box}>
        <p className="mb-2">
          <strong className="font-medium text-jc-black">Diagnóstico (dev):</strong> tu rol en la
          base es <code className="text-xs">{row.role}</code>. El portal solo acepta{" "}
          <code className="text-xs">licenciatario</code>.
        </p>
        <p>
          Ejecutá <code className="text-xs">pnpm promote:licenciatario {mail}</code>, cerrá sesión y
          volvé a iniciar sesión.
        </p>
      </div>
    );
  }

  return (
    <div className={box}>
      <p>
        <strong className="font-medium text-jc-black">Diagnóstico (dev):</strong> tu usuario ya
        tiene rol <code className="text-xs">licenciatario</code>. Si seguís en esta página, probá
        borrar cookies de <code className="text-xs">localhost</code> o una ventana privada y abrí de
        nuevo <code className="text-xs">/licenciatario/dashboard</code>.
      </p>
    </div>
  );
}
