import type { Database } from "@/types/database";
import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabasePublicKey, getSupabaseUrl } from "./env";

export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  user: User | null;
}> {
  const urlRaw = getSupabaseUrl().trim();
  const keyRaw = getSupabasePublicKey().trim();

  let supabaseResponse = NextResponse.next({ request });
  let user: User | null = null;

  if (!urlRaw || !keyRaw) {
    return { response: supabaseResponse, user: null };
  }

  try {
    const supabase = createServerClient<Database>(urlRaw, keyRaw, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    });

    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    user = u;
  } catch {
    supabaseResponse = NextResponse.next({ request });
    user = null;
  }

  return { response: supabaseResponse, user };
}
