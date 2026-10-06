"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Baby,
  PencilLine,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  UserRoundPlus,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import {
  JENIS_KELAMIN,
  STATUS_ANAK,
  STATUS_REKAM_ANAK,
  TINGKAT_PENDIDIKAN,
} from "@/lib/constants";
import type { Child } from "@/lib/types";
import { formatDateShort, hitungUsia, toDateInput } from "@/lib/utils";
import { Avatar, Badge, EmptyState, type BadgeTone } from "@/components/ui/primitives";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/controls";
import { ConfirmDialog, Modal } from "@/components/ui/dialog";

const STATUS_ANAK_TONE: Record<string, BadgeTone> = {
  Yatim: "pine",
  Piatu: "amber",
  "Yatim Piatu": "violet",
  Dhuafa: "sky",
};

const STATUS_REKAM_TONE: Record<string, BadgeTone> = {
  Aktif: "emerald",
  Pindah: "stone",
  Reunifikasi: "amber",
  Adopsi: "sky",
};

type FormState = {
  nama: string;
  jenisKelamin: string;
  statusAnak: string;
  tempatLahir: string;
  tanggalLahir: string;
  pendidikan: string;
  tanggalMasuk: string;
  namaWali: string;
  alamatAsal: string;
  kesehatan: string;
  status: string;
  catatan: string;
};

const emptyForm: FormState = {
  nama: "",
  jenisKelamin: "Laki-laki",
  statusAnak: "Yatim",
  tempatLahir: "",
  tanggalLahir: "",
  pendidikan: "",
  tanggalMasuk: toDateInput(new Date()),
  namaWali: "",
  alamatAsal: "",
  kesehatan: "Sehat",
  status: "Aktif",
  catatan: "",
};

function toForm(c: Child): FormState {
  return {
    nama: c.nama,
    jenisKelamin: c.jenisKelamin,
    statusAnak: c.statusAnak,
    tempatLahir: c.tempatLahir ?? "",
    tanggalLahir: toDateInput(c.tanggalLahir),
    pendidikan: c.pendidikan ?? "",
    tanggalMasuk: toDateInput(c.tanggalMasuk),
    namaWali: c.namaWali ?? "",
    alamatAsal: c.alamatAsal ?? "",
    kesehatan: c.kesehatan ?? "Sehat",
    status: c.status,
    catatan: c.catatan ?? "",
  };
}

export function AnakManager({ initialItems }: { initialItems: Child[] }) {
  const [items, setItems] = useState<Child[]>(initialItems);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [modal, setModal] = useState<{ mode: "create" } | { mode: "edit"; item: Child } | null>(
    null,
  );
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Child | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((c) => {
      const matchQuery =
        !q ||
        c.nama.toLowerCase().includes(q) ||
        c.kode.toLowerCase().includes(q) ||
        (c.pendidikan ?? "").toLowerCase().includes(q) ||
        (c.alamatAsal ?? "").toLowerCase().includes(q);
      const matchStatus = filterStatus === "Semua" || c.statusAnak === filterStatus;
      return matchQuery && matchStatus;
    });
  }, [items, search, filterStatus]);

  const summary = useMemo(() => {
    const aktif = items.filter((c) => c.status === "Aktif");
    return {
      total: items.length,
      aktif: aktif.length,
      putra: items.filter((c) => c.jenisKelamin === "Laki-laki").length,
      putri: items.filter((c) => c.jenisKelamin === "Perempuan").length,
    };
  }, [items]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function openCreate() {
    setForm(emptyForm);
    setModal({ mode: "create" });
  }

  function openEdit(item: Child) {
    setForm(toForm(item));
    setModal({ mode: "edit", item });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving || !modal) return;
    setSaving(true);
    const payload = { ...form };

    if (modal.mode === "create") {
      const temp: Child = {
        id: `temp-${Date.now()}`,
        kode: "BARU",
        nama: form.nama,
        jenisKelamin: form.jenisKelamin,
        tempatLahir: form.tempatLahir || null,
        tanggalLahir: form.tanggalLahir ? new Date(form.tanggalLahir).toISOString() : null,
        statusAnak: form.statusAnak,
        tanggalMasuk: form.tanggalMasuk
          ? new Date(form.tanggalMasuk).toISOString()
          : new Date().toISOString(),
        pendidikan: form.pendidikan || null,
        namaWali: form.namaWali || null,
        alamatAsal: form.alamatAsal || null,
        kesehatan: form.kesehatan || "Sehat",
        catatan: form.catatan || null,
        status: form.status,
        createdAt: new Date().toISOString(),
      };
      setItems((prev) => [temp, ...prev]);
      setModal(null);
      try {
        const created = await api<Child>("/api/children", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setItems((prev) => prev.map((c) => (c.id === temp.id ? created : c)));
        toast.success(`${created.nama} berhasil ditambahkan.`);
      } catch (err) {
        setItems((prev) => prev.filter((c) => c.id !== temp.id));
        toast.error(err instanceof Error ? err.message : "Gagal menambahkan data anak.");
      } finally {
        setSaving(false);
      }
      return;
    }

    const target = modal.item;
    const snapshot = items;
    setItems((prev) =>
      prev.map((c) => (c.id === target.id ? { ...c, ...toFormRow(form, c) } : c)),
    );
    setModal(null);
    setPendingId(target.id);
    try {
      const updated = await api<Child>(`/api/children/${target.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setItems((prev) => prev.map((c) => (c.id === target.id ? updated : c)));
      toast.success("Data anak berhasil diperbarui.");
    } catch (err) {
      setItems(snapshot);
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui data anak.");
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
    setItems((prev) => prev.filter((c) => c.id !== target.id));
    try {
      await api(`/api/children/${target.id}`, { method: "DELETE" });
      toast.success(`${target.nama} telah dihapus dari data anak asuh.`);
      setDeleting(null);
    } catch (err) {
      setItems(snapshot);
      toast.error(err instanceof Error ? err.message : "Gagal menghapus data.");
    } finally {
      setDeletingBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-pine-950 sm:text-4xl">Anak Asuh</h1>
          <p className="mt-2 text-sm text-stone-500">
            Pendataan anak yatim, piatu, dan dhuafa beserta status pendidikan &amp; kesehatannya.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Tambah Anak
        </Button>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {[
          `Total ${summary.total} anak`,
          `${summary.aktif} aktif`,
          `${summary.putra} laki-laki`,
          `${summary.putri} perempuan`,
        ].map((label) => (
          <span
            key={label}
            className="rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-stone-600"
          >
            {label}
          </span>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, kode, pendidikan, atau asal daerah..."
            className="pl-10"
          />
        </div>
        <div className="relative sm:w-56">
          <SlidersHorizontal className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="pl-10">
            <option value="Semua">Semua Status Anak</option>
            {STATUS_ANAK.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <EmptyState
          icon={Baby}
          title="Belum ada anak asuh terdaftar"
          description="Mulai dengan mendaftarkan anak asuh pertama beserta data pendidikan dan kesehatannya."
          action={
            <Button onClick={openCreate}>
              <UserRoundPlus className="h-4 w-4" />
              Tambah Anak Asuh
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Tidak ada hasil yang cocok"
          description="Coba ubah kata kunci pencarian atau reset filter status anak."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setFilterStatus("Semua");
              }}
            >
              Hapus Filter
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-xs md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-cream/60 text-left">
                  <th className="px-6 py-3.5 text-[11px] font-bold tracking-widest text-stone-400 uppercase">
                    Anak
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold tracking-widest text-stone-400 uppercase">
                    Usia
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold tracking-widest text-stone-400 uppercase">
                    Status
                  </th>
                  <th className="hidden px-4 py-3.5 text-[11px] font-bold tracking-widest text-stone-400 uppercase lg:table-cell">
                    Pendidikan
                  </th>
                  <th className="hidden px-4 py-3.5 text-[11px] font-bold tracking-widest text-stone-400 uppercase xl:table-cell">
                    Kesehatan
                  </th>
                  <th className="px-4 py-3.5 text-right text-[11px] font-bold tracking-widest text-stone-400 uppercase">
                    <span className="pr-2">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                <AnimatePresence initial={false}>
                  {filtered.map((c) => {
                    const usia = hitungUsia(c.tanggalLahir);
                    return (
                      <motion.tr
                        key={c.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: pendingId === c.id ? 0.55 : 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="group transition-colors hover:bg-pine-50/40"
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar name={c.nama} />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-stone-800">{c.nama}</p>
                              <p className="text-xs text-stone-400">
                                {c.kode} · {c.jenisKelamin}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <p className="font-semibold text-stone-700">
                            {usia !== null ? `${usia} th` : "—"}
                          </p>
                          <p className="text-xs text-stone-400">{formatDateShort(c.tanggalLahir)}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col items-start gap-1">
                            <Badge tone={STATUS_ANAK_TONE[c.statusAnak] ?? "stone"}>
                              {c.statusAnak}
                            </Badge>
                            <Badge tone={STATUS_REKAM_TONE[c.status] ?? "stone"} dot>
                              {c.status}
                            </Badge>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3.5 text-stone-600 lg:table-cell">
                          {c.pendidikan ?? "—"}
                        </td>
                        <td className="hidden px-4 py-3.5 text-stone-600 xl:table-cell">
                          {c.kesehatan ?? "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button size="icon" variant="ghost" onClick={() => openEdit(c)} aria-label={`Ubah ${c.nama}`}>
                              <PencilLine className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="hover:bg-rose-50 hover:text-rose-600"
                              onClick={() => setDeleting(c)}
                              aria-label={`Hapus ${c.nama}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-3 md:hidden">
            <AnimatePresence initial={false}>
              {filtered.map((c) => {
                const usia = hitungUsia(c.tanggalLahir);
                return (
                  <motion.div
                    key={c.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: pendingId === c.id ? 0.55 : 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar name={c.nama} size="lg" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-stone-800">{c.nama}</p>
                        <p className="text-xs text-stone-400">
                          {c.kode} · {usia !== null ? `${usia} tahun` : "usia —"}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <Badge tone={STATUS_ANAK_TONE[c.statusAnak] ?? "stone"}>{c.statusAnak}</Badge>
                          <Badge tone={STATUS_REKAM_TONE[c.status] ?? "stone"} dot>
                            {c.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(c)} aria-label={`Ubah ${c.nama}`}>
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="hover:bg-rose-50 hover:text-rose-600"
                          onClick={() => setDeleting(c)}
                          aria-label={`Hapus ${c.nama}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-stone-100 pt-3 text-xs">
                      <div>
                        <dt className="text-stone-400">Pendidikan</dt>
                        <dd className="font-semibold text-stone-700">{c.pendidikan ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-stone-400">Kesehatan</dt>
                        <dd className="font-semibold text-stone-700">{c.kesehatan ?? "—"}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-stone-400">Wali / Keluarga</dt>
                        <dd className="font-semibold text-stone-700">{c.namaWali ?? "Tanpa wali"}</dd>
                      </div>
                    </dl>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Create / edit modal */}
      <Modal
        open={modal !== null}
        onClose={() => !saving && setModal(null)}
        title={modal?.mode === "edit" ? "Ubah Data Anak" : "Tambah Anak Asuh"}
        description={
          modal?.mode === "edit"
            ? `Perbarui data ${modal.item.nama}.`
            : "Lengkapi data anak asuh baru di bawah ini."
        }
        size="lg"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nama Lengkap" required className="sm:col-span-2">
            <Input
              required
              value={form.nama}
              onChange={(e) => set("nama", e.target.value)}
              placeholder="cth. Ahmad Fajar Ramadhan"
            />
          </Field>
          <Field label="Jenis Kelamin" required>
            <Select value={form.jenisKelamin} onChange={(e) => set("jenisKelamin", e.target.value)}>
              {JENIS_KELAMIN.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status Anak" required>
            <Select value={form.statusAnak} onChange={(e) => set("statusAnak", e.target.value)}>
              {STATUS_ANAK.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tempat Lahir">
            <Input
              value={form.tempatLahir}
              onChange={(e) => set("tempatLahir", e.target.value)}
              placeholder="cth. Bantul"
            />
          </Field>
          <Field label="Tanggal Lahir">
            <Input
              type="date"
              value={form.tanggalLahir}
              onChange={(e) => set("tanggalLahir", e.target.value)}
            />
          </Field>
          <Field label="Pendidikan">
            <Select value={form.pendidikan} onChange={(e) => set("pendidikan", e.target.value)}>
              <option value="">Belum / tidak sekolah</option>
              {TINGKAT_PENDIDIKAN.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tanggal Masuk Panti" required>
            <Input
              type="date"
              required
              value={form.tanggalMasuk}
              onChange={(e) => set("tanggalMasuk", e.target.value)}
            />
          </Field>
          <Field label="Wali / Keluarga" hint="Kosongkan jika tanpa wali (rujukan Dinsos).">
            <Input
              value={form.namaWali}
              onChange={(e) => set("namaWali", e.target.value)}
              placeholder="cth. Slamet Riyadi (Paman)"
            />
          </Field>
          <Field label="Kondisi Kesehatan">
            <Input
              value={form.kesehatan}
              onChange={(e) => set("kesehatan", e.target.value)}
              placeholder="cth. Sehat"
            />
          </Field>
          <Field label="Alamat Asal" className="sm:col-span-2">
            <Input
              value={form.alamatAsal}
              onChange={(e) => set("alamatAsal", e.target.value)}
              placeholder="cth. Bantul, Yogyakarta"
            />
          </Field>
          <Field label="Status Rekam">
            <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
              {STATUS_REKAM_ANAK.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Catatan" className="sm:col-span-2">
            <Textarea
              value={form.catatan}
              onChange={(e) => set("catatan", e.target.value)}
              placeholder="Prestasi, kebutuhan khusus, riwayat, dll."
            />
          </Field>
          <div className="flex justify-end gap-2.5 pt-1 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={() => setModal(null)} disabled={saving}>
              Batal
            </Button>
            <Button type="submit" loading={saving}>
              {modal?.mode === "edit" ? "Simpan Perubahan" : "Tambah Anak"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deletingBusy}
        title="Hapus Data Anak"
        description={`Yakin ingin menghapus ${deleting?.nama ?? "data ini"}? Riwayat pendidikan dan kesehatan yang tercatat akan ikut hilang dan tidak dapat dikembalikan.`}
      />
    </div>
  );
}

function toFormRow(form: FormState, base: Child): Child {
  return {
    ...base,
    nama: form.nama,
    jenisKelamin: form.jenisKelamin,
    statusAnak: form.statusAnak,
    tempatLahir: form.tempatLahir || null,
    tanggalLahir: form.tanggalLahir ? new Date(form.tanggalLahir).toISOString() : null,
    pendidikan: form.pendidikan || null,
    tanggalMasuk: form.tanggalMasuk ? new Date(form.tanggalMasuk).toISOString() : base.tanggalMasuk,
    namaWali: form.namaWali || null,
    alamatAsal: form.alamatAsal || null,
    kesehatan: form.kesehatan || "Sehat",
    status: form.status,
    catatan: form.catatan || null,
  };
}
