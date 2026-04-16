import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getAdminSession } from "@/lib/admin/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session.ok) {
    if (session.reason === "unauthenticated") {
      redirect("/auth/login?next=/admin");
    }
    redirect("/licenciatario/access-denied");
  }

  return (
    <div className="min-h-screen bg-gradient-page text-jc-black">
      <AdminHeader email={session.user.email ?? ""} role={session.role} />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[260px_1fr] md:px-6">
        <AdminSidebar />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
