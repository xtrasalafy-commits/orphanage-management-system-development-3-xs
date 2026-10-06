"use client";

import { motion } from "framer-motion";
import { Baby, HandCoins, PackageOpen, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Stat cards                                                          */
/* ------------------------------------------------------------------ */

export function rupiahSingkat(v: number) {
  if (v >= 1_000_000_000)
    return `Rp ${(v / 1e9).toLocaleString("id-ID", { maximumFractionDigits: 1 })} M`;
  if (v >= 1_000_000)
    return `Rp ${(v / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  if (v >= 1_000) return `Rp ${Math.round(v / 1e3)} rb`;
  return `Rp ${v}`;
}

export function StatCards({
  anakAktif,
  pengasuhAktif,
  donasiBulanIni,
  kebutuhanMendesak,
}: {
  anakAktif: number;
  pengasuhAktif: number;
  donasiBulanIni: number;
  kebutuhanMendesak: number;
}) {
  const stats = [
    {
      label: "Anak Asuh Aktif",
      value: anakAktif.toLocaleString("id-ID"),
      caption: "Yatim, piatu & dhuafa",
      icon: Baby,
      iconClass: "bg-pine-100 text-pine-700",
    },
    {
      label: "Pengasuh & Staf Aktif",
      value: pengasuhAktif.toLocaleString("id-ID"),
      caption: "Melayani setiap hari",
      icon: Users,
      iconClass: "bg-sky-100 text-sky-700",
    },
    {
      label: "Donasi Bulan Ini",
      value: rupiahSingkat(donasiBulanIni),
      caption: "Donasi uang masuk",
      icon: HandCoins,
      iconClass: "bg-amber-100 text-amber-700",
    },
    {
      label: "Kebutuhan Prioritas",
      value: kebutuhanMendesak.toLocaleString("id-ID"),
      caption: "Mendesak & tinggi, belum terpenuhi",
      icon: PackageOpen,
      iconClass: "bg-rose-100 text-rose-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="group relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-md hover:shadow-pine-900/5"
        >
          <div
            aria-hidden
            className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-pine-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
          <div className="relative">
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-2xl",
                stat.iconClass,
              )}
            >
              <stat.icon className="h-5.5 w-5.5" strokeWidth={1.9} />
            </div>
            <p className="mt-4 font-display text-3xl font-semibold tracking-tight text-pine-950">
              {stat.value}
            </p>
            <p className="mt-1 text-[13px] font-semibold text-stone-700">{stat.label}</p>
            <p className="text-xs text-stone-400">{stat.caption}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Donations area chart                                                */
/* ------------------------------------------------------------------ */

const fullRupiah = (v: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

export function DonationsChart({ data }: { data: { label: string; total: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="donasiGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#276755" stopOpacity={0.32} />
            <stop offset="100%" stopColor="#276755" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 6" stroke="#e7e4dc" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "#78716c", fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
          dy={8}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#a8a29e" }}
          axisLine={false}
          tickLine={false}
          width={48}
          tickFormatter={(v: number) => (v >= 1e6 ? `${Math.round(v / 1e6)} jt` : `${v}`)}
        />
        <Tooltip
          cursor={{ stroke: "#276755", strokeOpacity: 0.25, strokeDasharray: "4 4" }}
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <div className="rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 shadow-lg">
                <p className="text-xs font-semibold text-stone-500">{label}</p>
                <p className="text-sm font-bold text-pine-800">
                  {fullRupiah(Number(payload[0].value))}
                </p>
              </div>
            ) : null
          }
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#276755"
          strokeWidth={2.5}
          fill="url(#donasiGradient)"
          dot={{ r: 3.5, fill: "#276755", strokeWidth: 2, stroke: "#fff" }}
          activeDot={{ r: 5, fill: "#0d352c", strokeWidth: 2, stroke: "#fff" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------ */
/* Children status donut                                               */
/* ------------------------------------------------------------------ */

const STATUS_COLORS = ["#276755", "#f59e0b", "#8b5cf6", "#38bdf8"];

export function StatusDonut({
  data,
  total,
}: {
  data: { name: string; value: number }[];
  total: number;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-stone-400">
        Belum ada anak asuh aktif.
      </div>
    );
  }
  return (
    <div className="flex h-full items-center gap-2">
      <div className="relative h-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={3}
              cornerRadius={5}
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <div className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs shadow-lg">
                    <span className="font-semibold text-stone-700">{payload[0].name}:</span>{" "}
                    <span className="font-bold text-pine-800">{payload[0].value} anak</span>
                  </div>
                ) : null
              }
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-display text-2xl leading-none font-bold text-pine-950">{total}</p>
          <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-stone-400 uppercase">
            Anak
          </p>
        </div>
      </div>
      <ul className="w-[46%] space-y-2">
        {data.map((entry, i) => (
          <li key={entry.name} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: STATUS_COLORS[i % STATUS_COLORS.length] }}
            />
            <span className="truncate font-medium text-stone-600">{entry.name}</span>
            <span className="ml-auto font-bold text-pine-950">{entry.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
