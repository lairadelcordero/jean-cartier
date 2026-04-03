import { LicenciatarioHeader } from "@/components/licenciatario/licenciatario-header";
import { getLicenciatarioSession } from "@/lib/licenciatario/auth";
import { redirect } from "next/navigation";

export default async function LicenciatarioPortalLayout({
  children,
}: { children: React.ReactNode }) {
  const ctx = await getLicenciatarioSession();
  if (!ctx.ok) {
    if (ctx.reason === "unauthenticated") {
      redirect("/auth/login?next=/licenciatario/dashboard");
    }
    redirect("/licenciatario/access-denied");
  }

  return (
    <div className="min-h-screen bg-gradient-page font-inter text-jc-black">
      <LicenciatarioHeader email={ctx.user.email ?? ""} />
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">{children}</div>
    </div>
  );
}
