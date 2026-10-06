"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Baby,
  CalendarDays,
  HandCoins,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageOpen,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { SafeUser } from "@/lib/types";
import { Avatar } from "@/components/ui/primitives";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
  { href: "/anak", label: "Anak Asuh", icon: Baby },
  { href: "/pengasuh", label: "Pengasuh & Staf", icon: Users },
  { href: "/donasi", label: "Donasi", icon: HandCoins },
  { href: "/kebutuhan", label: "Kebutuhan Dasar", icon: PackageOpen },
  { href: "/kegiatan", label: "Kegiatan", icon: CalendarDays },
];

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pine-400 to-pine-700 text-white shadow-lg shadow-black/25">
        <HeartHandshake className="h-5.5 w-5.5" strokeWidth={1.8} />
      </div>
      <div>
        <p className="font-display text-[15px] leading-tight font-semibold text-white">
          SIMPA Nur Kasih
        </p>
        <p className="text-[10.5px] font-medium tracking-wider text-pine-300/80 uppercase">
          Panti Asuhan
        </p>
      </div>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="mt-8 space-y-1 px-4">
      <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.18em] text-pine-300/60 uppercase">
        Menu Utama
      </p>
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
              active ? "text-white" : "text-pine-200/70 hover:bg-white/5 hover:text-white",
            )}
          >
            {active && (
              <motion.span
                layoutId="nav-active-pill"
                className="absolute inset-0 rounded-xl bg-white/10 ring-1 ring-white/15"
                transition={{ type: "spring", damping: 30, stiffness: 380 }}
              />
            )}
            <item.icon
              className={cn(
                "relative h-4.5 w-4.5",
                active ? "text-amber-300" : "text-pine-300/70 group-hover:text-pine-200",
              )}
              strokeWidth={1.9}
            />
            <span className="relative">{item.label}</span>
            {active && (
              <motion.span
                layoutId="nav-active-dot"
                className="relative ml-auto h-1.5 w-1.5 rounded-full bg-amber-300"
                transition={{ type: "spring", damping: 30, stiffness: 380 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function Sidebar({ user }: { user: SafeUser }) {
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-6">
        <Brand />
      </div>
      <div className="flex-1 overflow-y-auto pb-4">
        <NavList />
        <div className="mx-5 mt-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.03] p-4">
          <p className="font-display text-sm font-semibold text-white">Tugas mulia</p>
          <p className="mt-1 text-xs leading-relaxed text-pine-200/70">
            &ldquo;Sebaik-baik manusia adalah yang paling bermanfaat bagi orang lain.&rdquo;
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
          <Avatar name={user.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-[11px] font-medium text-pine-300/80">{user.role}</p>
          </div>
          <button
            onClick={logout}
            disabled={loggingOut}
            title="Keluar"
            aria-label="Keluar"
            className="rounded-xl p-2 text-pine-200/70 transition hover:bg-rose-500/15 hover:text-rose-300 disabled:opacity-50"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function DashboardShell({ user, children }: { user: SafeUser; children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-cream">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">
        <div
          className="h-full bg-pine-950"
          style={{
            backgroundImage:
              "radial-gradient(700px 320px at 0% 0%, rgba(84,157,131,0.22), transparent 65%), radial-gradient(500px 380px at 100% 100%, rgba(251,191,36,0.07), transparent 60%)",
          }}
        >
          <Sidebar user={user} />
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.button
              aria-label="Tutup menu"
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-pine-950/50 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="absolute inset-y-0 left-0 w-72 bg-pine-950 shadow-2xl"
            >
              <Sidebar user={user} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="lg:pl-72">
        {/* Mobile topbar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-stone-200/70 bg-cream/85 px-4 py-3 backdrop-blur-lg lg:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Buka menu"
            className="rounded-xl border border-stone-200 bg-white p-2.5 text-stone-600 shadow-xs transition hover:bg-stone-50"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pine-600 to-pine-900 text-white">
              <HeartHandshake className="h-4.5 w-4.5" strokeWidth={1.9} />
            </div>
            <p className="font-display text-sm font-semibold text-pine-950">SIMPA Nur Kasih</p>
          </div>
          <Avatar name={user.name} size="sm" className="ml-auto" />
        </header>

        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-9 lg:py-9"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
