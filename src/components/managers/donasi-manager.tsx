"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarClock,
  HandCoins,
  Package,
  PencilLine,
  Plus,
  Search,
  Trash2,
  Wallet,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { JENIS_DONASI } from "@/lib/constants";
import type { Donation } from "@/lib/types";
import { formatDateShort, formatRupiah, toDateInput } from "@/lib/utils";
import { Avatar, Badge, EmptyState, type BadgeTone } from "@/components/ui/primitives";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/controls";
import { ConfirmDialog, Modal } from "@/components/ui/dialog";

const JENIS_TONE: Record<string, BadgeTone> = {
  Uang: "pine",
  Sembako: "amber",
  Barang: "sky",
};

type FormState = {
  namaDonatur: string;
  jenis: string;
  jumlah: string;
  barang: string;
  tanggal: string;
  catatan: string;
};

const emptyForm: FormState = {
  namaDonatur: "",
  jenis: "Uang",
  jumlah: "",
  barang: "",
  tanggal: toDateInput(new Date()),
  catatan: "",
};

function toForm(d: Donation): FormState {
  return {
    namaDonatur: d.namaDonatur,
    jenis: d.jenis,
    jumlah: d.jumlah !== null ? String(d.jumlah) : "",
    barang: d.barang ?? "",
    tanggal: toDateInput(d.tanggal),
    catatan: d.catatan ?? "",
  };
}

export function DonasiManager({ initialItems }: { initialItems: Donation[] }) {
  const [items, setItems] = useState<Donation[]>(initialItems);
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [modal, setModal] = useState<{ mode: "create" } | { mode: "edit"; item: Donation } | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Donation | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((d) => {
      const matchQuery =
        !q ||
        d.namaDonatur.toLowerCase().includes(q) ||
        (d.barang ?? "").toLowerCase().includes(q) ||
        (d.catatan ?? "").toLowerCase().includes(q);
      return matchQuery && (filterJenis === "Semua" || d.jenis === filterJenis);
    });
  }, [items, search, filterJenis]);

  const ringkasan = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      totalUang: items.filter((d) => d.jenis === "Uang").reduce((s, d) => s + (d.jumlah ?? 0), 0),
      bulanIni: items
        .filter((d) => d.jenis === "Uang" && new Date(d.tanggal) >= monthStart)
        .reduce((s, d) => s + (d.jumlah ?? 0), 0),
      nonUang: items.filter((d) => d.jenis !== "Uang").length,
    };
  }, [items]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function buildPayload() {
    return {
      namaDonatur: form.namaDonatur,
      jenis: form.jenis,
      jumlah: form.jenis === "Uang" && form.jumlah ? Number(form.jumlah) : null,
      barang: form.jenis !== "Uang" ? form.barang : null,
      tanggal: form.tanggal,
      catatan: form.catatan,
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving || !modal) return;
    setSaving(true);

    if (modal.mode === "create") {
      const temp: Donation = {
        id: `temp-${Date.now()}`,
        namaDonatur: form.namaDonatur,
        jenis: form.jenis,
        jumlah: form.jenis === "Uang" && form.jumlah ? Number(form.jumlah) : null,
        barang: form.jenis !== "Uang" ? form.barang : null,
        tanggal: form.tanggal ? new Date(form.tanggal).toISOString() : new Date().toISOString(),
        catatan: form.catatan || null,
        createdAt: new Date().toISOString(),
      };
      setItems((prev) => [temp, ...prev]);
      setModal(null);
      try {
        const created = await api<Donation>("/api/donations", {
          method: "POST",
          body: JSON.stringify(buildPayload()),
        });
        setItems((prev) =>
          prev
            .map((d) => (d.id === temp.id ? created : d))
            .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()),
        );
        toast.success(`Donasi dari ${created.namaDonatur} tercatat.`);
      } catch (err) {
        setItems((prev) => prev.filter((d) => d.id !== temp.id));
        toast.error(err instanceof Error ? err.message : "Gagal mencatat donasi.");
      } finally {
        setSaving(false);
      }
      return;
    }

    const target = modal.item;
    const snapshot = items;
    setItems((prev) =>
      prev.map((d) =>
        d.id === target.id
          ? {
              ...d,
              namaDonatur: form.namaDonatur,
              jenis: form.jenis,
              jumlah: form.jenis === "Uang" && form.jumlah ? Number(form.jumlah) : null,
              barang: form.jenis !== "Uang" ? form.barang : null,
              tanggal: form.tanggal ? new Date(form.tanggal).toISOString() : d.tanggal,
              catatan: form.catatan || null,
            }
          : d,
      ),
    );
    setModal(null);
    setPendingId(target.id);
    try {
      const updated = await api<Donation>(`/api/donations/${target.id}`, {
        method: "PATCH",
        body: JSON.stringify(buildPayload()),
      });
      setItems((prev) => prev.map((d) => (d.id === target.id ? updated : d)));
      toast.success("Catatan donasi berhasil diperbarui.");
    } catch (err) {
      setItems(snapshot);
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui donasi.");
    } finally {
      setSaving(false);
      setPendingId(null);
    }
  }

  async function handleDelete() {
    if (!deleting || deletingBusy) return;
    const target = deleting;
    const snapshot = items;
    setDeletingBusy(true);
    setItems((prev) => prev.filter((d) => d.id !== target.id));
    try {
      await api(`/api/donations/${target.id}`, { method: "DELETE" });
      toast.success("Catatan donasi telah dihapus.");
      setDeleting(null);
    } catch (err) {
      setItems(snapshot);
      toast.error(err instanceof Error ? err.message : "Gagal menghapus donasi.");
    } finally {
      setDeletingBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-pine-950 sm:text-4xl">Donasi</h1>
          <p className="mt-2 text-sm text-stone-500">
            Pencatatan donasi uang, sembako, dan barang dari para dermawan.
          </p>
        </div>
        <Button
          onClick={() => {
            setForm(emptyForm);
            setModal({ mode: "create" });
          }}
        >
          <Plus className="h-4 w-4" />
          Catat Donasi
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            label: "Total Donasi Uang",
            value: formatRupiah(ringkasan.totalUang),
            icon: Wallet,
            cls: "bg-pine-100 text-pine-700",
          },
          {
            label: "Donasi Uang Bulan Ini",
            value: formatRupiah(ringkasan.bulanIni),
            icon: CalendarClock,
            cls: "bg-amber-100 text-amber-700",
          },
          {
            label: "Donasi Sembako & Barang",
            value: `${ringkasan.nonUang} donasi`,
            icon: Package,
            cls: "bg-sky-100 text-sky-700",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-4 rounded-3xl border border-stone-200/80 bg-white p-5 shadow-xs"
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${s.cls}`}>
              <s.icon className="h-5.5 w-5.5" strokeWidth={1.9} />
            </div>
            <div>
              <p className="font-display text-xl leading-tight font-semibold text-pine-950">
                {s.value}
              </p>
              <p className="text-xs font-medium text-stone-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari donatur, uraian barang, atau catatan..."
              className="pl-10"
            />
          </div>
          <Select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="sm:w-48"
          >
            <option value="Semua">Semua Jenis</option>
            {JENIS_DONASI.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </Select>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={HandCoins}
          title="Belum ada donasi tercatat"
          description="Catat donasi pertama yang masuk — baik berupa uang maupun barang kebutuhan anak."
          action={
            <Button
              onClick={() => {
                setForm(emptyForm);
                setModal({ mode: "create" });
              }}
            >
              <Plus className="h-4 w-4" />
              Catat Donasi Pertama
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Tidak ada hasil yang cocok"
          description="Coba kata kunci lain atau reset filter jenis donasi."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setFilterJenis("Semua");
              }}
            >
              Hapus Filter
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-cream/60 text-left">
                  <th className="px-6 py-3.5 text-[11px] font-bold tracking-widest text-stone-400 uppercase">
                    Donatur
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold tracking-widest text-stone-400 uppercase">
                    Jenis
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold tracking-widest text-stone-400 uppercase">
                    Nominal / Uraian
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold tracking-widest text-stone-400 uppercase">
                    Tanggal
                  </th>
                  <th className="px-4 py-3.5 text-right text-[11px] font-bold tracking-widest text-stone-400 uppercase">
                    <span className="pr-2">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                <AnimatePresence initial={false}>
                  {filtered.map((d) => (
                    <motion.tr
                      key={d.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: pendingId === d.id ? 0.55 : 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="group transition-colors hover:bg-pine-50/40"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={d.namaDonatur} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-stone-800">{d.namaDonatur}</p>
                            {d.catatan && (
                              <p className="max-w-56 truncate text-xs text-stone-400">{d.catatan}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge tone={JENIS_TONE[d.jenis] ?? "stone"}>{d.jenis}</Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        {d.jenis === "Uang" ? (
                          <span className="font-bold whitespace-nowrap text-pine-700">
                            {formatRupiah(d.jumlah)}
                          </span>
                        ) : (
                          <span className="line-clamp-2 max-w-xs text-stone-600">{d.barang}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-stone-500">
                        {formatDateShort(d.tanggal)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setForm(toForm(d));
                              setModal({ mode: "edit", item: d });
                            }}
                            aria-label="Ubah donasi"
                          >
                            <PencilLine className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="hover:bg-rose-50 hover:text-rose-600"
                            onClick={() => setDeleting(d)}
                            aria-label="Hapus donasi"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={modal !== null}
        onClose={() => !saving && setModal(null)}
        title={modal?.mode === "edit" ? "Ubah Catatan Donasi" : "Catat Donasi Baru"}
        description={
          modal?.mode === "edit"
            ? `Perbarui donasi dari ${modal.item.namaDonatur}.`
            : "Catat donasi uang, sembako, atau barang yang diterima panti."
        }
        size="lg"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nama Donatur" required className="sm:col-span-2">
            <Input
              required
              value={form.namaDonatur}
              onChange={(e) => set("namaDonatur", e.target.value)}
              placeholder="cth. Hamba Allah / PT Sinar Abadi Jaya"
            />
          </Field>
          <Field label="Jenis Donasi" required>
            <Select value={form.jenis} onChange={(e) => set("jenis", e.target.value)}>
              {JENIS_DONASI.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tanggal Diterima" required>
            <Input
              type="date"
              required
              value={form.tanggal}
              onChange={(e) => set("tanggal", e.target.value)}
            />
          </Field>
          {form.jenis === "Uang" ? (
            <Field label="Nominal (Rp)" required className="sm:col-span-2">
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-sm font-semibold text-stone-400">
                  Rp
                </span>
                <Input
                  type="number"
                  min={1}
                  required
                  value={form.jumlah}
                  onChange={(e) => set("jumlah", e.target.value)}
                  placeholder="0"
                  className="pl-10"
                />
              </div>
            </Field>
          ) : (
            <Field label="Uraian Barang / Sembako" required className="sm:col-span-2">
              <Textarea
                required
                value={form.barang}
                onChange={(e) => set("barang", e.target.value)}
                placeholder="cth. Beras 2 karung @25 kg, minyak goreng 2 dus"
              />
            </Field>
          )}
          <Field label="Catatan" className="sm:col-span-2">
            <Textarea
              value={form.catatan}
              onChange={(e) => set("catatan", e.target.value)}
              placeholder="Amanah/peruntukan donasi, ucapan, dsb. (opsional)"
            />
          </Field>
          <div className="flex justify-end gap-2.5 pt-1 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={() => setModal(null)} disabled={saving}>
              Batal
            </Button>
            <Button type="submit" loading={saving}>
              {modal?.mode === "edit" ? "Simpan Perubahan" : "Catat Donasi"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deletingBusy}
        title="Hapus Catatan Donasi"
        description={`Yakin ingin menghapus catatan donasi dari ${deleting?.namaDonatur ?? "donatur ini"}? Laporan arus donasi ikut berubah.`}
      />
    </div>
  );
}
