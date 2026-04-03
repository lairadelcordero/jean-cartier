import { SignupForm } from "@/components/auth/signup-form";
import { SiteAccessNav } from "@/components/site/site-access-nav";
import { Suspense } from "react";

export default function SignupPage() {
  return (
    <>
      <SiteAccessNav />
      <main className="flex min-h-screen items-center justify-center bg-jc-gray-50 px-4 pb-8 pt-24 sm:pt-28">
        <Suspense fallback={<p className="p-6 text-jc-gray-500">Cargando…</p>}>
          <SignupForm />
        </Suspense>
      </main>
    </>
  );
}
