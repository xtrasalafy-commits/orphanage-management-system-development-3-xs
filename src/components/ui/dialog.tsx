"use client";

import { AnimatePresence, motion } from "framer-motion";
import { TriangleAlert, X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./controls";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.button
            aria-label="Tutup"
            onClick={onClose}
            className="absolute inset-0 bg-pine-950/45 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.98 }}
            transition={{ type: "spring", damping: 27, stiffness: 340 }}
            className={cn(
              "relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl shadow-pine-950/30 sm:rounded-3xl",
              size === "md" ? "sm:max-w-lg" : "sm:max-w-2xl",
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 px-6 pt-5 pb-4">
              <div>
                <h2 className="font-display text-lg leading-snug font-semibold text-pine-950">
                  {title}
                </h2>
                {description && <p className="mt-0.5 text-[13px] text-stone-500">{description}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Tutup dialog"
                className="rounded-xl p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Ya, Hapus",
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <TriangleAlert className="h-5.5 w-5.5" strokeWidth={1.9} />
        </div>
        <p className="pt-1 text-sm leading-relaxed text-stone-600">{description}</p>
      </div>
      <div className="mt-6 flex justify-end gap-2.5">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Batal
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
