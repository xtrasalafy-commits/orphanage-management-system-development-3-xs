"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { AnimatePresence, motion } from "framer-motion";
import { Coffee, Download, Heart, QrCode, X } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

const TRAKTEER_URL = "https://trakteer.id/perpus_opera/";
const SOURCE_ZIP_URL = "/source-code.zip";

// Nominal traktiran: mulai dari Rp6.000 dan kelipatannya.
const NOMINALS = [
  6_000, 12_000, 18_000, 24_000, 36_000, 50_000, 100_000, 200_000,
];

export function TrakteerWidget() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  // Tracks which nominal the current QR was generated for; while it differs
  // from `picked`, the QR is (re)generating.
  const [qrFor, setQrFor] = useState<number | null>(null);
  const qrBusy = qrFor !== picked || qrDataUrl === null;

  // Generate QR code in-app whenever a nominal is picked — no page redirect.
  useEffect(() => {
    if (picked === null) return;
    let cancelled = false;
    QRCode.toDataURL(TRAKTEER_URL, {
      width: 260,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#164239", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) {
          setQrDataUrl(url);
          setQrFor(picked);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrDataUrl(null);
          setQrFor(picked);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [picked]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Floating button — bottom right */}
      <div className="fixed right-4 bottom-4 z-40 sm:right-6 sm:bottom-6">
        <AnimatePresence mode="wait">
          {open ? null : (
            <motion.button
              key="fab"
              initial={{ opacity: 0, scale: 0.85, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => {
                setPicked(6_000);
                setOpen(true);
              }}
              aria-label="Traktir kopi"
              className="group inline-flex items-center gap-2.5 rounded-full border border-amber-300/60 bg-gradient-to-br from-amber-400 to-orange-500 py-3 pr-5 pl-4 font-semibold text-white shadow-lg shadow-orange-900/25 backdrop-blur transition hover:from-amber-500 hover:to-orange-600 hover:shadow-xl hover:shadow-orange-900/30"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/25">
                <Coffee className="h-4 w-4" strokeWidth={2} />
              </span>
              <span className="flex flex-col items-start leading-tight">
                <span className="text-sm">Traktir Kopi</span>
                <span className="hidden text-[10px] font-medium text-white/85 sm:inline">
                  Web app ini gratis &amp; bebas iklan
                </span>
              </span>
              <motion.span
                aria-hidden
                className="absolute -top-1 -right-1 flex h-3 w-3"
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-70" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500" />
              </motion.span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Trakteer panel */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
            <motion.button
              aria-label="Tutup"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-pine-950/50 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            />
            <motion.div
              initial={{ opacity: 0, y: 48, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.98 }}
              transition={{ type: "spring", damping: 27, stiffness: 340 }}
              className="relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl shadow-pine-950/30 sm:rounded-3xl"
            >
              {/* Header */}
              <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 px-6 pt-6 pb-5 text-white">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "radial-gradient(300px 160px at 85% -20%, rgba(255,255,255,0.7), transparent 65%)",
                  }}
                />
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Tutup dialog"
                  className="absolute top-4 right-4 rounded-xl bg-white/20 p-1.5 text-white transition hover:bg-white/35"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="relative flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/25">
                    <Coffee className="h-5.5 w-5.5" strokeWidth={2} />
                  </span>
                  <div>
                    <h2 className="font-display text-lg leading-tight font-semibold">
                      Traktir Creator ☕
                    </h2>
                    <p className="text-[11px] font-medium text-white/85">
                      Dukung terus pengembangannya
                    </p>
                  </div>
                </div>
                <p className="relative mt-3 text-[13px] leading-relaxed text-white/95">
                  Web app ini gratis &amp; bebas iklan. Kopi kecil, server tetap
                  jalan. 🙏
                </p>
              </div>

              <div className="overflow-y-auto px-6 py-5">
                {/* Nominal options */}
                <p className="mb-2.5 text-[13px] font-semibold text-stone-700">
                  Pilih nominal traktiran
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {NOMINALS.map((n) => {
                    const active = picked === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPicked(n)}
                        className={`rounded-xl border px-2 py-3 text-sm font-bold transition ${
                          active
                            ? "border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-500/25"
                            : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"
                        }`}
                      >
                        {formatRupiah(n).replace("Rp", "Rp ")}
                      </button>
                    );
                  })}
                </div>

                {/* QR code */}
                <div className="mt-5 rounded-2xl border border-stone-200 bg-cream/60 p-5 text-center">
                  <p className="mb-3 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-stone-700">
                    <QrCode className="h-4 w-4 text-orange-600" />
                    Scan QR untuk traktir
                    {picked !== null ? ` ${formatRupiah(picked)}` : ""}
                  </p>
                  <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-2xl border border-stone-200 bg-white p-3 shadow-inner">
                    {qrBusy ? (
                      <div className="flex h-full w-full animate-pulse items-center justify-center rounded-xl bg-stone-100">
                        <QrCode className="h-10 w-10 text-stone-300" />
                      </div>
                    ) : qrDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrDataUrl}
                        alt={`QR code untuk traktir ${picked !== null ? formatRupiah(picked) : ""} via Trakteer`}
                        className="h-full w-full rounded-lg object-contain"
                      />
                    ) : (
                      <p className="px-4 text-xs text-stone-400">
                        Gagal membuat QR. Coba buka halaman Trakteer langsung.
                      </p>
                    )}
                  </div>
                  <p className="mt-3 text-[11px] leading-relaxed text-stone-500">
                    Scan dengan kamera ponsel, lalu lanjutkan pembayaran sesuai
                    nominal yang dipilih.
                  </p>
                  <a
                    href={TRAKTEER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-amber-500 hover:to-orange-600"
                  >
                    <Heart className="h-4 w-4" />
                    Buka Trakteer
                  </a>
                </div>

                {/* Open source note + source download */}
                <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-pine-200/70 bg-pine-50 p-4 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-pine-900">
                      Open Source oleh MZF — 2026
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-pine-700/80">
                      Kode sumber lengkap web app ini tersedia secara gratis.
                    </p>
                  </div>
                  <a
                    href={SOURCE_ZIP_URL}
                    download
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-pine-300 bg-white px-4 py-2.5 text-[13px] font-semibold text-pine-800 transition hover:bg-pine-100"
                  >
                    <Download className="h-4 w-4" />
                    Download Source
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
