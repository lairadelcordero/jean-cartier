import { createClient } from "@/lib/supabase/server";
import type { Database, UserRole } from "@/types/database";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type AdminRole = Extract<UserRole, "sudo" | "admin" | "editor">;

export type AdminClient = SupabaseClient<Database>;
export type AdminSession = {
  supabase: AdminClient;
  user: User;
  role: UserRole;
};

function isAdmin(role: UserRole | null): role is AdminRole {
  return role === "sudo" || role === "admin" || role === "editor";
}

export async function getAdminSession(): Promise<
  ({ ok: true } & AdminSession) | { ok: false; reason: "unauthenticated" | "forbidden" }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, reason: "unauthenticated" };
  }

  const { data: row, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !row || !isAdmin(row.role)) {
    return { ok: false, reason: "forbidden" };
  }

  return { ok: true, supabase, user, role: row.role };
}

export async function requireAdminApi() {
  const session = await getAdminSession();
  if (!session.ok) {
    if (session.reason === "unauthenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (session.role === "editor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}

export async function requireEditorApi() {
  const session = await getAdminSession();
  if (!session.ok) {
    if (session.reason === "unauthenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}

export async function requireSudoApi() {
  const session = await getAdminSession();
  if (!session.ok) {
    if (session.reason === "unauthenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (session.role !== "sudo") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}
