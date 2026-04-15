import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

const AUTH_PATHS = /^\/auth(\/|$)/;
const CALLBACK_PATH = "/api/auth/callback";

/** Routes that require a session (REQ-1 / REQ-2). */
function isProtectedPath(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/licenciatario") ||
    pathname.startsWith("/admin")
  );
}

function isLicenciatarioApi(pathname: string): boolean {
  return pathname.startsWith("/api/licenciatario");
}

function isAdminApi(pathname: string): boolean {
  return pathname.startsWith("/api/admin");
}

export async function proxy(req: NextRequest) {
  let response: NextResponse;
  let user: Awaited<ReturnType<typeof updateSession>>["user"];

  try {
    const ctx = await updateSession(req);
    response = ctx.response;
    user = ctx.user;
  } catch (err) {
    // Evita MIDDLEWARE_INVOCATION_FAILED en Vercel si falta env, cookies raras, etc.
    console.error("[proxy] updateSession error:", err);
    response = NextResponse.next({ request: req });
    user = null;
  }

  const { pathname } = req.nextUrl;

  if (pathname.startsWith(CALLBACK_PATH) || AUTH_PATHS.test(pathname)) {
    return response;
  }

  if (isLicenciatarioApi(pathname) || isAdminApi(pathname)) {
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please log in to access your portal" },
        { status: 401 }
      );
    }
    return response;
  }

  if (!isProtectedPath(pathname)) {
    return response;
  }

  if (!user) {
    const login = new URL("/auth/login", req.url);
    const next = `${pathname}${req.nextUrl.search}`;
    login.searchParams.set("next", next);
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
