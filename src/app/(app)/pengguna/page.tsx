import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { UsersView } from "@/components/users/UsersView";
import { requireAdmin } from "@/lib/auth";
import { getProfiles } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Manajemen Pengguna" };

export default async function PenggunaPage() {
  const user = await requireAdmin();
  const users = await getProfiles();

  return (
    <div>
      <PageHeader
        title="Manajemen Pengguna"
        description="Kelola akun admin dan penjaga toko, atur peran, serta status akun."
      />
      <UsersView users={users} currentUserId={user.id} />
    </div>
  );
}
