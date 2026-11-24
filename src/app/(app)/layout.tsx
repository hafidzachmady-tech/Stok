import { AppShell } from "@/components/AppShell";
import { ToastProvider } from "@/components/Toast";
import { requireUser } from "@/lib/auth";
import { getDashboardStats } from "@/lib/data";
import { getSettings } from "@/lib/db";
import { todayLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [stats, settings] = await Promise.all([getDashboardStats(), getSettings()]);
  const alertCount = stats.menipis + stats.habis;

  return (
    <ToastProvider>
      <AppShell
        user={user}
        alertCount={alertCount}
        storeName={settings.store_name}
        today={todayLabel()}
      >
        {children}
      </AppShell>
    </ToastProvider>
  );
}
