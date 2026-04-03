import { SiteAccessNav } from "@/components/site/site-access-nav";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/dashboard");
  }

  return (
    <>
      <SiteAccessNav />
      <main className="mx-auto max-w-lg px-4 pb-8 pt-24 sm:pt-28 md:px-8">
        <h1 className="mb-2 text-title-md font-semibold text-jc-black">Panel (protegido)</h1>
        <p className="mb-4 text-body text-jc-gray-700">
          Sesión: <span className="font-mono text-sm">{user.email}</span>
        </p>
        <Link href="/" className="text-sm text-jc-gold underline">
          Volver al inicio
        </Link>
      </main>
    </>
  );
}
