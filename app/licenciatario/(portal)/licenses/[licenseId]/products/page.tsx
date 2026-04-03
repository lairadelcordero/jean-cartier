import { LicenseProductsClient } from "@/components/licenciatario/license-products-client";
import { assertOwnLicense } from "@/lib/licenciatario/auth";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";

type PageProps = { params: Promise<{ licenseId: string }> };

export default async function LicenseProductsPage({ params }: PageProps) {
  const { licenseId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login?next=/licenciatario/dashboard");
  }

  const owns = await assertOwnLicense(supabase, user.id, licenseId);
  if (!owns) {
    notFound();
  }

  const { data: license } = await supabase
    .from("licenses")
    .select("category")
    .eq("id", licenseId)
    .single();

  if (!license) {
    notFound();
  }

  return <LicenseProductsClient licenseId={licenseId} categoryLabel={license.category} />;
}
