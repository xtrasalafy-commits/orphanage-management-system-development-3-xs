"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, Eye, EyeOff, HeartHandshake, Loader2, Lock, Mail, Sparkles } from "lucide-react";

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@nurkasih.or.id", password: "admin123" },
  { label: "Pengasuh", email: "pengasuh@nurkasih.or.id", password: "pengasuh123" },
];

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? "Gagal masuk. Periksa kembali kredensial Anda.");
        setLoading(false);
        return;
      }
      const from = searchParams.get("from");
      router.replace(from && from.startsWith("/") ? from : "/dashboard");
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server. Coba beberapa saat lagi.");
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md"
    >
      {/* Brand */}
      <div className="mb-10 flex items-center gap-3.5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pine-700 to-pine-950 text-white shadow-lg shadow-pine-900/25">
          <HeartHandshake className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <div>
          <p className="font-display text-xl leading-tight font-semibold text-pine-950">
            SIMPA Nur Kasih
          </p>
          <p className="text-xs font-medium tracking-wide text-stone-500">
            Sistem Manajemen Panti Asuhan
          </p>
        </div>
      </div>

      <h1 className="font-display text-3xl font-medium text-pine-950 sm:text-4xl">
        Selamat datang kembali
      </h1>
      <p className="mt-2.5 text-sm leading-relaxed text-stone-500">
        Masuk untuk mengelola data anak asuh, pengasuh, donasi, kebutuhan dasar, dan kegiatan
        perlindungan anak.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </motion.div>
        )}

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-stone-700">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-stone-400" />
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@nurkasih.or.id"
              className="w-full rounded-xl border border-stone-200 bg-white py-3 pr-4 pl-11 text-sm text-stone-900 shadow-xs transition placeholder:text-stone-400 focus:border-pine-600 focus:ring-4 focus:ring-pine-600/15 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-stone-700">
            Kata Sandi
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-stone-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi"
              className="w-full rounded-xl border border-stone-200 bg-white py-3 pr-12 pl-11 text-sm text-stone-900 shadow-xs transition placeholder:text-stone-400 focus:border-pine-600 focus:ring-4 focus:ring-pine-600/15 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              className="absolute top-1/2 right-3.5 -translate-y-1/2 rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-pine-800 py-3.5 text-sm font-semibold text-white shadow-lg shadow-pine-900/20 transition hover:bg-pine-700 focus:ring-4 focus:ring-pine-600/25 focus:outline-none active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Memproses..." : "Masuk ke Dasbor"}
        </button>
      </form>

      {/* Demo accounts */}
      <div className="mt-8 rounded-2xl border border-pine-200/70 bg-pine-50 p-4">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-pine-800 uppercase">
          <Sparkles className="h-3.5 w-3.5" />
          Akun demo — klik untuk mengisi
        </p>
        <div className="space-y-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => {
                setEmail(acc.email);
                setPassword(acc.password);
                setError(null);
              }}
              className="flex w-full items-center justify-between rounded-xl border border-pine-200/60 bg-white px-4 py-2.5 text-left transition hover:border-pine-400 hover:shadow-sm"
            >
              <span>
                <span className="block text-sm font-semibold text-pine-950">{acc.label}</span>
                <span className="block text-xs text-stone-500">{acc.email}</span>
              </span>
              <span className="rounded-lg bg-pine-100 px-2.5 py-1 font-mono text-[11px] font-semibold text-pine-800">
                {acc.password}
              </span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
