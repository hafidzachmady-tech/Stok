"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAction } from "@/lib/actions/auth";
import { roleLabel } from "@/lib/format";
import type { SessionUser } from "@/lib/types";
import { Icon, type IconName } from "./Icon";

type NavItem = { href: string; label: string; icon: IconName; adminOnly?: boolean };

const NAV: NavItem[] = [
  { href: "/beranda", label: "Beranda", icon: "home" },
  { href: "/barang", label: "Daftar Barang", icon: "box" },
  { href: "/stok", label: "Catat Stok", icon: "swap" },
  { href: "/belanja", label: "Daftar Belanja", icon: "cart" },
  { href: "/riwayat", label: "Riwayat Stok", icon: "history" },
  { href: "/pengguna", label: "Manajemen Pengguna", icon: "users", adminOnly: true },
  { href: "/pengaturan", label: "Pengaturan", icon: "settings", adminOnly: true },
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function ConnectionStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (online) {
    return (
      <span
        className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-muted"
        title="Koneksi internet terhubung"
      >
        <span className="h-2 w-2 rounded-full bg-brand-500" />
        Online
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full bg-warn-bg px-3 py-1.5 text-xs font-semibold text-warn"
      title="Koneksi internet terputus"
    >
      <Icon name="wifi-off" size={14} />
      Offline — data tidak dapat disimpan
    </span>
  );
}

function BrandBlock({ storeName }: { storeName: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm">
        <Icon name="store" size={22} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-extrabold tracking-tight text-ink">TokoKelontong</p>
        <p className="truncate text-xs text-muted">{storeName}</p>
      </div>
    </div>
  );
}

function NavLinks({
  user,
  alertCount,
  onNavigate,
}: {
  user: SessionUser;
  alertCount: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = NAV.filter((item) => !item.adminOnly || user.role === "admin");

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Navigasi utama">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-brand-50 text-brand-800"
                : "text-muted hover:bg-cream hover:text-ink"
            }`}
          >
            <Icon
              name={item.icon}
              size={19}
              className={active ? "text-brand-700" : "text-muted group-hover:text-ink"}
            />
            <span className="flex-1">{item.label}</span>
            {item.href === "/belanja" && alertCount > 0 ? (
              <span className="rounded-full bg-warn-bg px-2 py-0.5 text-[11px] font-bold text-warn">
                {alertCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function UserCard({ user }: { user: SessionUser }) {
  return (
    <div className="border-t border-line px-3 py-3">
      <div className="mb-2 flex items-center gap-3 rounded-xl bg-cream px-3 py-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">
          {initials(user.full_name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{user.full_name}</p>
          <p className="truncate text-xs text-muted">{roleLabel(user.role)}</p>
        </div>
      </div>
      <form action={logoutAction}>
        <button type="submit" className="btn-ghost w-full justify-start gap-3 px-3 text-sm">
          <Icon name="logout" size={18} />
          Keluar
        </button>
      </form>
    </div>
  );
}

export function AppShell({
  user,
  alertCount,
  storeName,
  today,
  children,
}: {
  user: SessionUser;
  alertCount: number;
  storeName: string;
  today: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen bg-cream">
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-line bg-white lg:flex">
        <BrandBlock storeName={storeName} />
        <div className="h-px bg-line" />
        <NavLinks user={user} alertCount={alertCount} />
        <UserCard user={user} />
      </aside>

      {drawerOpen ? (
        <div className="no-print fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            className="absolute inset-0 bg-ink/45"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative flex h-full w-[280px] max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between pr-3">
              <BrandBlock storeName={storeName} />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-cream"
                aria-label="Tutup menu"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="h-px bg-line" />
            <div className="flex flex-1 flex-col overflow-y-auto">
              <NavLinks user={user} alertCount={alertCount} onNavigate={() => setDrawerOpen(false)} />
              <UserCard user={user} />
            </div>
          </div>
        </div>
      ) : null}

      <div className="lg:pl-[264px]">
        <header className="no-print sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-cream/95 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-ink"
            aria-label="Buka menu"
          >
            <Icon name="menu" size={20} />
          </button>
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-white">
              <Icon name="store" size={17} />
            </span>
            <span className="truncate text-sm font-bold">TokoKelontong</span>
          </div>
          <Link
            href="/belanja"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-ink"
            aria-label={alertCount > 0 ? `${alertCount} barang perlu diisi ulang` : "Daftar belanja"}
          >
            <Icon name="bell" size={19} />
            {alertCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-warn px-1 text-[10px] font-bold text-white">
                {alertCount > 99 ? "99+" : alertCount}
              </span>
            ) : null}
          </Link>
        </header>

        <div className="no-print hidden items-center justify-between gap-4 px-8 pt-6 lg:flex">
          <p className="inline-flex items-center gap-2 text-sm text-muted">
            <Icon name="calendar" size={16} />
            {today}
          </p>
          <div className="flex items-center gap-2">
            <ConnectionStatus />
            <Link
              href="/belanja"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-ink transition hover:bg-cream"
              aria-label={alertCount > 0 ? `${alertCount} barang perlu diisi ulang` : "Daftar belanja"}
            >
              <Icon name="bell" size={19} />
              {alertCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-warn px-1 text-[10px] font-bold text-white">
                  {alertCount > 99 ? "99+" : alertCount}
                </span>
              ) : null}
            </Link>
            <div className="flex items-center gap-2.5 rounded-xl border border-line bg-white py-1.5 pl-1.5 pr-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-[11px] font-bold text-white">
                {initials(user.full_name)}
              </span>
              <div className="leading-tight">
                <p className="max-w-[140px] truncate text-xs font-semibold">{user.full_name}</p>
                <p className="text-[11px] text-muted">{roleLabel(user.role)}</p>
              </div>
            </div>
          </div>
        </div>

        <main className="mx-auto w-full max-w-7xl px-4 pb-20 pt-5 sm:px-6 lg:px-8 lg:pt-4">{children}</main>
      </div>
    </div>
  );
}
