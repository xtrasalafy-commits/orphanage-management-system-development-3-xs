import { asc, desc } from "drizzle-orm";
import { ArrowRight, CalendarClock, HandCoins, LibraryBig } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/db";
import { activities, children, donations, needs, staff } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { STATUS_ANAK } from "@/lib/constants";
import { formatDateShort, formatRupiah, hitungUsia } from "@/lib/utils";
import { Avatar, Badge, type BadgeTone } from "@/components/ui/primitives";
import { DonationsChart, StatCards, StatusDonut } from "@/components/dashboard/widgets";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Beranda" };

const PRIORITY_WEIGHT: Record<string, number> = { Mendesak: 0, Tinggi: 1, Sedang: 2, Rendah: 3 };
const PRIORITY_TONE: Record<string, BadgeTone> = {
  Mendesak: "rose",
  Tinggi: "amber",
  Sedang: "sky",
  Rendah: "stone",
};

function jakartaNow() {
  const now = new Date();
  return { now };
}

export default async function DashboardPage() {
  const user = await getSessionUser();
  const { now } = jakartaNow();
  const hour = Number(
    new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "numeric",
      hour12: false,
    }).format(now),
  );
  const waktu = hour < 11 ? "pagi" : hour < 15 ? "siang" : hour < 19 ? "sore" : "malam";
  const tanggalLengkap = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  const [childRows, staffRows, donationRows, needRows, activityRows] = await Promise.all([
    db.select().from(children).orderBy(asc(children.nama)),
    db.select().from(staff),
    db.select().from(donations).orderBy(desc(donations.tanggal)),
    db.select().from(needs),
    db.select().from(activities).orderBy(asc(activities.tanggal)),
  ]);

  const anakAktif = childRows.filter((c) => c.status === "Aktif");
  const pengasuhAktif = staffRows.filter((s) => s.status === "Aktif").length;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const donasiBulanIni = donationRows
    .filter((d) => d.jenis === "Uang" && d.tanggal >= monthStart)
    .reduce((sum, d) => sum + (d.jumlah ?? 0), 0);
  const kebutuhanMendesak = needRows.filter(
    (n) => n.status === "Dibutuhkan" && (n.prioritas === "Mendesak" || n.prioritas === "Tinggi"),
  ).length;

  // Donasi uang per bulan — 6 bulan terakhir
  const monthly: { label: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const total = donationRows
      .filter((d) => d.jenis === "Uang" && d.tanggal >= start && d.tanggal < end)
      .reduce((sum, d) => sum + (d.jumlah ?? 0), 0);
    monthly.push({
      label: start.toLocaleDateString("id-ID", { month: "short" }),
      total,
    });
  }

  const statusCounts = STATUS_ANAK.map((s) => ({
    name: s,
    value: anakAktif.filter((c) => c.statusAnak === s).length,
  })).filter((s) => s.value > 0);

  const ageBuckets = [
    { label: "0–6 th", min: 0, max: 6 },
    { label: "7–12 th", min: 7, max: 12 },
    { label: "13–15 th", min: 13, max: 15 },
    { label: "16+ th", min: 16, max: 99 },
  ].map((b) => ({
    label: b.label,
    count: anakAktif.filter((c) => {
      const usia = hitungUsia(c.tanggalLahir);
      return usia !== null && usia >= b.min && usia <= b.max;
    }).length,
  }));
  const maxAge = Math.max(1, ...ageBuckets.map((b) => b.count));

  const urgentNeeds = needRows
    .filter((n) => n.status === "Dibutuhkan")
    .sort(
      (a, b) =>
        (PRIORITY_WEIGHT[a.prioritas] ?? 9) - (PRIORITY_WEIGHT[b.prioritas] ?? 9) ||
        a.nama.localeCompare(b.nama),
    )
    .slice(0, 5);

  const recentDonations = donationRows.slice(0, 5);

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const upcomingActivities = activityRows
    .filter((a) => a.status === "Terjadwal" && a.tanggal >= today)
    .slice(0, 4);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold tracking-wide text-pine-700">{tanggalLengkap}</p>
          <h1 className="mt-1 font-display text-3xl font-medium text-pine-950 sm:text-4xl">
            Selamat {waktu}, {user?.name.split(" ")[0] ?? "Sahabat"}
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            Berikut ringkasan kondisi Panti Asuhan Nur Kasih hari ini.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link
            href="/kegiatan"
            className="hidden items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-xs transition hover:bg-stone-50 sm:inline-flex"
          >
            Jadwalkan Kegiatan
          </Link>
          <Link
            href="/donasi"
            className="inline-flex items-center gap-2 rounded-xl bg-pine-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-pine-700"
          >
            <HandCoins className="h-4 w-4" />
            Catat Donasi
          </Link>
        </div>
      </div>

      <StatCards
        anakAktif={anakAktif.length}
        pengasuhAktif={pengasuhAktif}
        donasiBulanIni={donasiBulanIni}
        kebutuhanMendesak={kebutuhanMendesak}
      />

      {/* Charts row */}
      <div className="grid gap-5 lg:grid-cols-5">
        <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs lg:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-pine-950">Arus Donasi Uang</h2>
              <p className="mt-0.5 text-xs text-stone-400">Akumulasi 6 bulan terakhir</p>
            </div>
            <Badge tone="pine" dot>
              {formatRupiah(monthly.reduce((s, m) => s + m.total, 0))}
            </Badge>
          </div>
          <div className="mt-5 h-64">
            <DonationsChart data={monthly} />
          </div>
        </section>

        <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs lg:col-span-2">
          <h2 className="font-display text-lg font-semibold text-pine-950">Profil Anak Asuh</h2>
          <p className="mt-0.5 text-xs text-stone-400">
            Berdasarkan status &amp; rentang usia anak aktif
          </p>
          <div className="mt-2 h-44">
            <StatusDonut data={statusCounts} total={anakAktif.length} />
          </div>
          <div className="mt-3 space-y-2.5 border-t border-stone-100 pt-4">
            {ageBuckets.map((b) => (
              <div key={b.label} className="flex items-center gap-3">
                <span className="w-14 text-xs font-medium text-stone-500">{b.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-pine-500 to-pine-700 transition-all"
                    style={{ width: `${(b.count / maxAge) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right text-xs font-bold text-pine-950">{b.count}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Lists row */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Kebutuhan mendesak */}
        <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-pine-950">Kebutuhan Prioritas</h2>
            <Link
              href="/kebutuhan"
              className="inline-flex items-center gap-1 text-xs font-semibold text-pine-700 transition hover:text-pine-500"
            >
              Lihat semua <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {urgentNeeds.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <LibraryBig className="h-8 w-8 text-stone-300" />
              <p className="mt-3 text-sm font-medium text-stone-500">
                Semua kebutuhan sudah terpenuhi.
              </p>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-stone-100">
              {urgentNeeds.map((n) => (
                <li key={n.id} className="flex items-center gap-3 py-3">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      n.prioritas === "Mendesak" ? "bg-rose-500" : n.prioritas === "Tinggi" ? "bg-amber-500" : "bg-sky-500"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-800">{n.nama}</p>
                    <p className="text-xs text-stone-400">
                      {n.jumlah} {n.satuan} · {n.kategori}
                    </p>
                  </div>
                  <Badge tone={PRIORITY_TONE[n.prioritas] ?? "stone"}>{n.prioritas}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Donasi terbaru */}
        <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-pine-950">Donasi Terbaru</h2>
            <Link
              href="/donasi"
              className="inline-flex items-center gap-1 text-xs font-semibold text-pine-700 transition hover:text-pine-500"
            >
              Lihat semua <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentDonations.length === 0 ? (
            <p className="py-10 text-center text-sm font-medium text-stone-500">
              Belum ada donasi tercatat.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-stone-100">
              {recentDonations.map((d) => (
                <li key={d.id} className="flex items-center gap-3 py-3">
                  <Avatar name={d.namaDonatur} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-800">{d.namaDonatur}</p>
                    <p className="truncate text-xs text-stone-400">
                      {formatDateShort(d.tanggal)} · {d.jenis === "Uang" ? "Donasi uang" : d.barang}
                    </p>
                  </div>
                  {d.jenis === "Uang" ? (
                    <span className="text-sm font-bold whitespace-nowrap text-pine-700">
                      {formatRupiah(d.jumlah)}
                    </span>
                  ) : (
                    <Badge tone="amber">Barang</Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Kegiatan terdekat */}
        <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-pine-950">Kegiatan Terdekat</h2>
            <Link
              href="/kegiatan"
              className="inline-flex items-center gap-1 text-xs font-semibold text-pine-700 transition hover:text-pine-500"
            >
              Lihat semua <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {upcomingActivities.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <CalendarClock className="h-8 w-8 text-stone-300" />
              <p className="mt-3 text-sm font-medium text-stone-500">
                Belum ada kegiatan terjadwal.
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {upcomingActivities.map((a) => {
                const d = a.tanggal;
                return (
                  <li
                    key={a.id}
                    className="flex items-center gap-3.5 rounded-2xl border border-stone-100 bg-cream/60 p-3"
                  >
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-pine-800 text-white">
                      <span className="text-base leading-none font-bold">{d.getDate()}</span>
                      <span className="text-[10px] font-medium tracking-wide uppercase">
                        {d.toLocaleDateString("id-ID", { month: "short" })}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-stone-800">{a.nama}</p>
                      <p className="truncate text-xs text-stone-400">{a.lokasi ?? "Panti Nur Kasih"}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
