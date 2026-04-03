import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export type LicenciatarioClient = SupabaseClient<Database>;

export type LicenciatarioSession = {
  supabase: LicenciatarioClient;
  user: User;
};

export async function getLicenciatarioSession(): Promise<
  | ({ ok: true } & LicenciatarioSession & { role: "licenciatario" })
  | { ok: false; reason: "unauthenticated" | "forbidden" }
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

  if (error || !row || row.role !== "licenciatario") {
    return { ok: false, reason: "forbidden" };
  }

  return { ok: true, supabase, user, role: "licenciatario" };
}

export async function assertOwnLicense(
  supabase: LicenciatarioClient,
  licenciatarioId: string,
  licenseId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("licenses")
    .select("id")
    .eq("id", licenseId)
    .eq("licenciatario_id", licenciatarioId)
    .maybeSingle();
  return !error && !!data;
}

export type LicenciatarioApiOk = {
  supabase: LicenciatarioClient;
  user: User;
  role: "licenciatario";
};

export async function requireLicenciatarioApi(): Promise<NextResponse | LicenciatarioApiOk> {
  const ctx = await getLicenciatarioSession();
  if (!ctx.ok) {
    if (ctx.reason === "unauthenticated") {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please log in to access your portal" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Forbidden", message: "You do not have permission to access this portal" },
      { status: 403 }
    );
  }
  return { supabase: ctx.supabase, user: ctx.user, role: ctx.role };
}
