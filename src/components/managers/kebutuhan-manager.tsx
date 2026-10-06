"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  HeartPulse,
  Home,
  PencilLine,
  Plus,
  Search,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Trash2,
  Utensils,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { KATEGORI_KEBUTUHAN, PRIORITAS } from "@/lib/constants";
import type { Need } from "@/lib/types";
import { cn, formatDateShort, formatRupiah, toDateInput } from "@/lib/utils";
import { Badge, EmptyState, type BadgeTone } from "@/components/ui/primitives";
import { Button, Field, Input, Select } from "@/components/ui/controls";
import { ConfirmDialog, Modal } from "@/components/ui/dialog";

const KATEGORI_ICON: Record<string, typeof Utensils> = {
  "Makanan & Gizi": Utensils,
  Pakaian: Shirt,
  Pendidikan: BookOpen,
  Kesehatan: HeartPulse,
  "Tempat Tinggal": Home,
  Perlindungan: ShieldCheck,
  Lainnya: ShoppingBag,
};

const PRIORITAS_TONE: Record<string, BadgeTone> = {
  Mendesak: "rose",
  Tinggi: "amber",
  Sedang: "sky",
  Rendah: "stone",
};

const PRIORITAS_WEIGHT: Record<string, number> = { Mendesak: 0, Tinggi: 1, Sedang: 2, Rendah: 3 };

type FormState = {
  nama: string;
  kategori: string;
  jumlah: string;
  satuan: string;
  prioritas: string;
  estimasiBiaya: string;
  tanggalDibutuhkan: string;
};

const emptyForm: FormState = {
  nama: "",
  kategori: "Makanan & Gizi",
  jumlah: "1",
  satuan: "unit",
  prioritas: "Sedang",
  estimasiBiaya: "",
  tanggalDibutuhkan: "",
};

function toForm(n: Need): FormState {
  return {
    nama: n.nama,
    kategori: n.kategori,
    jumlah: String(n.jumlah),
    satuan: n.satuan,
    prioritas: n.prioritas,
    estimasiBiaya: n.estimasiBiaya !== null ? String(n.estimasiBiaya) : "",
    tanggalDibutuhkan: toDateInput(n.tanggalDibutuhkan),
  };
}

export function KebutuhanManager({ initialItems }: { initialItems: Need[] }) {
  const [items, setItems] = useState<Need[]>(initialItems);
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [modal, setModal] = useState<{ mode: "create" } | { mode: "edit"; item: Need } | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Need | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((n) => {
        const matchQuery = !q || n.nama.toLowerCase().includes(q);
        const matchKategori = filterKategori === "Semua" || n.kategori === filterKategori;
        const matchStatus = filterStatus === "Semua" || n.status === filterStatus;
        return matchQuery && matchKategori && matchStatus;
      })
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === "Dibutuhkan" ? -1 : 1;
        return (PRIORITAS_WEIGHT[a.prioritas] ?? 9) - (PRIORITAS_WEIGHT[b.prioritas] ?? 9);
      });
  }, [items, search, filterKategori, filterStatus]);

  const progress = useMemo(() => {
    const terpenuhi = items.filter((n) => n.status === "Terpenuhi").length;
    const total = items.length;
    const estimasiSisa = items
      .filter((n) => n.status === "Dibutuhkan")
      .reduce((s, n) => s + (n.estimasiBiaya ?? 0), 0);
    return { terpenuhi, total, pct: total === 0 ? 0 : Math.round((terpenuhi / total) * 100), estimasiSisa };
  }, [items]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function buildPayload() {
    return {
      nama: form.nama,
      kategori: form.kategori,
      jumlah: Number(form.jumlah) || 1,
      satuan: form.satuan || "unit",
      prioritas: form.prioritas,
      estimasiBiaya: form.estimasiBiaya ? Number(form.estimasiBiaya) : null,
      tanggalDibutuhkan: form.tanggalDibutuhkan || null,
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving || !modal) return;
    setSaving(true);
    const payload = buildPayload();

    if (modal.mode === "create") {
      const temp: Need = {
        id: `temp-${Date.now()}`,
        ...payload,
        estimasiBiaya: payload.estimasiBiaya ?? null,
        tanggalDibutuhkan: payload.tanggalDibutuhkan
          ? new Date(payload.tanggalDibutuhkan).toISOString()
          : null,
        status: "Dibutuhkan",
        createdAt: new Date().toISOString(),
      };
      setItems((prev) => [temp, ...prev]);
      setModal(null);
      try {
        const created = await api<Need>("/api/needs", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setItems((prev) => prev.map((n) => (n.id === temp.id ? created : n)));
        toast.success("Kebutuhan baru berhasil dicatat.");
      } catch (err) {
        setItems((prev) => prev.filter((n) => n.id !== temp.id));
        toast.error(err instanceof Error ? err.message : "Gagal mencatat kebutuhan.");
      } finally {
        setSaving(false);
      }
      return;
    }

    const target = modal.item;
    const snapshot = items;
    setItems((prev) =>
      prev.map((n) =>
        n.id === target.id
          ? {
              ...n,
              ...payload,
              estimasiBiaya: payload.estimasiBiaya ?? null,
              tanggalDibutuhkan: payload.tanggalDibutuhkan
                ? new Date(payload.tanggalDibutuhkan).toISOString()
                : null,
            }
          : n,
      ),
    );
    setModal(null);
    setPendingId(target.id);
    try {
      const updated = await api<Need>(`/api/needs/${target.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setItems((prev) => prev.map((n) => (n.id === target.id ? updated : n)));
      toast.success("Data kebutuhan berhasil diperbarui.");
    } catch (err) {
      setItems(snapshot);
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui kebutuhan.");
    } finally {
      setSaving(false);
      setPendingId(null);
    }
  }

  async function toggleTerpenuhi(need: Need) {
    const next = need.status === "Terpenuhi" ? "Dibutuhkan" : "Terpenuhi";
    const snapshot = items;
    setItems((prev) => prev.map((n) => (n.id === need.id ? { ...n, status: next } : n)));
    setPendingId(need.id);
    try {
      const updated = await api<Need>(`/api/needs/${need.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      setItems((prev) => prev.map((n) => (n.id === need.id ? updated : n)));
      if (next === "Terpenuhi") {
        toast.success(`"${need.nama}" ditandai terpenuhi. Terima kasih para donatur!`);
      } else {
        toast.info(`"${need.nama}" dibuka kembali sebagai kebutuhan.`);
      }
    } catch (err) {
      setItems(snapshot);
      toast.error(err instanceof Error ? err.message : "Gagal mengubah status.");
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete() {
    if (!deleting || deletingBusy) return;
    const target = deleting;
    const snapshot = items;
    setDeletingBusy(true);
    setItems((prev) => prev.filter((n) => n.id !== target.id));
    try {
      await api(`/api/needs/${target.id}`, { method: "DELETE" });
      toast.success("Kebutuhan telah dihapus.");
      setDeleting(null);
    } catch (err) {
      setItems(snapshot);
      toast.error(err instanceof Error ? err.message : "Gagal menghapus kebutuhan.");
    } finally {
      setDeletingBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-pine-950 sm:text-4xl">
            Kebutuhan Dasar &amp; Perlindungan
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            Daftar kebutuhan pokok, pendidikan, kesehatan, tempat tinggal, dan perlindungan anak.
          </p>
        </div>
        <Button
          onClick={() => {
            setForm(emptyForm);
            setModal({ mode: "create" });
          }}
        >
          <Plus className="h-4 w-4" />
          Tambah Kebutuhan
        </Button>
      </div>

      {/* Progress */}
      {items.length > 0 && (
        <div className="grid gap-4 rounded-3xl border border-stone-200/80 bg-gradient-to-br from-white to-pine-50/60 p-6 shadow-xs sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-bold text-pine-950">
                {progress.terpenuhi} dari {progress.total} kebutuhan terpenuhi
              </p>
              <p className="font-display text-2xl font-semibold text-pine-700">{progress.pct}%</p>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-pine-950/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-pine-500 to-pine-700"
                initial={{ width: 0 }}
                animate={{ width: `${progress.pct}%` }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
          <div className="rounded-2xl border border-pine-200/70 bg-white px-5 py-3 sm:text-right">
            <p className="text-[11px] font-bold tracking-wider text-stone-400 uppercase">
              Estimasi biaya tersisa
            </p>
            <p className="font-display text-xl font-semibold text-pine-800">
              {formatRupiah(progress.estimasiSisa)}
            </p>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama kebutuhan..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-3">
            <Select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="flex-1 lg:w-56"
            >
              <option value="Semua">Semua Kategori</option>
              {KATEGORI_KEBUTUHAN.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </Select>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 lg:w-44"
            >
              <option value="Semua">Semua Status</option>
              <option value="Dibutuhkan">Dibutuhkan</option>
              <option value="Terpenuhi">Terpenuhi</option>
            </Select>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Belum ada kebutuhan terdaftar"
          description="Catat kebutuhan dasar anak asuh — dari pangan, sandang, pendidikan, hingga program perlindungan."
          action={
            <Button
              onClick={() => {
                setForm(emptyForm);
                setModal({ mode: "create" });
              }}
            >
              <Plus className="h-4 w-4" />
              Tambah Kebutuhan Pertama
            </Button>
          }
        />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Tidak ada hasil yang cocok"
          description="Coba kata kunci lain atau reset filter kategori & status."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setFilterKategori("Semua");
                setFilterStatus("Semua");
              }}
            >
              Hapus Filter
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-xs">
          <ul className="divide-y divide-stone-100">
            <AnimatePresence initial={false}>
              {sorted.map((n) => {
                const Icon = KATEGORI_ICON[n.kategori] ?? ShoppingBag;
                const done = n.status === "Terpenuhi";
                return (
                  <motion.li
                    key={n.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: pendingId === n.id ? 0.55 : 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-pine-50/40 sm:px-6"
                  >
                    <button
                      onClick={() => toggleTerpenuhi(n)}
                      disabled={pendingId === n.id}
                      aria-label={done ? "Buka kembali kebutuhan" : "Tandai terpenuhi"}
                      className={cn(
                        "shrink-0 rounded-full transition disabled:opacity-50",
                        done ? "text-pine-600" : "text-stone-300 hover:text-pine-500",
                      )}
                    >
                      {done ? (
                        <CheckCircle2 className="h-6 w-6" strokeWidth={2} />
                      ) : (
                        <Circle className="h-6 w-6" strokeWidth={2} />
                      )}
                    </button>
                    <div
                      className={cn(
                        "hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:flex",
                        done ? "bg-stone-100 text-stone-400" : "bg-pine-50 text-pine-700",
                      )}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.9} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate font-semibold",
                          done ? "text-stone-400 line-through decoration-stone-300" : "text-stone-800",
                        )}
                      >
                        {n.nama}
                      </p>
                      <p className="text-xs text-stone-400">
                        {n.jumlah} {n.satuan} · {n.kategori}
                        {n.estimasiBiaya ? ` · ${formatRupiah(n.estimasiBiaya)}` : ""}
                        {n.tanggalDibutuhkan ? ` · target ${formatDateShort(n.tanggalDibutuhkan)}` : ""}
                      </p>
                    </div>
                    <Badge tone={done ? "pine" : (PRIORITAS_TONE[n.prioritas] ?? "stone")} dot>
                      {done ? "Terpenuhi" : n.prioritas}
                    </Badge>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setForm(toForm(n));
                          setModal({ mode: "edit", item: n });
                        }}
                        aria-label="Ubah kebutuhan"
                      >
                        <PencilLine className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="hover:bg-rose-50 hover:text-rose-600"
                        onClick={() => setDeleting(n)}
                        aria-label="Hapus kebutuhan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </div>
      )}

      <Modal
        open={modal !== null}
        onClose={() => !saving && setModal(null)}
        title={modal?.mode === "edit" ? "Ubah Kebutuhan" : "Tambah Kebutuhan"}
        description="Catat kebutuhan beserta jumlah, prioritas, dan estimasi biayanya."
        size="lg"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nama Kebutuhan" required className="sm:col-span-2">
            <Input
              required
              value={form.nama}
              onChange={(e) => set("nama", e.target.value)}
              placeholder="cth. Seragam sekolah tahun ajaran baru"
            />
          </Field>
          <Field label="Kategori" required>
            <Select value={form.kategori} onChange={(e) => set("kategori", e.target.value)}>
              {KATEGORI_KEBUTUHAN.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Prioritas" required>
            <Select value={form.prioritas} onChange={(e) => set("prioritas", e.target.value)}>
              {PRIORITAS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Jumlah" required>
            <Input
              type="number"
              min={1}
              required
              value={form.jumlah}
              onChange={(e) => set("jumlah", e.target.value)}
            />
          </Field>
          <Field label="Satuan" hint="cth. set, pak, kg, sesi, anak">
            <Input
              value={form.satuan}
              onChange={(e) => set("satuan", e.target.value)}
              placeholder="unit"
            />
          </Field>
          <Field label="Estimasi Biaya (Rp)">
            <div className="relative">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-sm font-semibold text-stone-400">
                Rp
              </span>
              <Input
                type="number"
                min={0}
                value={form.estimasiBiaya}
                onChange={(e) => set("estimasiBiaya", e.target.value)}
                placeholder="0"
                className="pl-10"
              />
            </div>
          </Field>
          <Field label="Target Tanggal Dibutuhkan">
            <Input
              type="date"
              value={form.tanggalDibutuhkan}
              onChange={(e) => set("tanggalDibutuhkan", e.target.value)}
            />
          </Field>
          <div className="flex justify-end gap-2.5 pt-1 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={() => setModal(null)} disabled={saving}>
              Batal
            </Button>
            <Button type="submit" loading={saving}>
              {modal?.mode === "edit" ? "Simpan Perubahan" : "Tambah Kebutuhan"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deletingBusy}
        title="Hapus Kebutuhan"
        description={`Yakin ingin menghapus "${deleting?.nama ?? "kebutuhan ini"}" dari daftar kebutuhan?`}
      />
    </div>
  );
}
