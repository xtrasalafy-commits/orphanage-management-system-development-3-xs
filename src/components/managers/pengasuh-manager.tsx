"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Mail,
  PencilLine,
  Phone,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users,
  UserRoundPlus,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { JABATAN_STAF, JENIS_KELAMIN, STATUS_STAF } from "@/lib/constants";
import type { StaffMember } from "@/lib/types";
import { formatDateShort, toDateInput } from "@/lib/utils";
import { Avatar, Badge, EmptyState, type BadgeTone } from "@/components/ui/primitives";
import { Button, Field, Input, Select } from "@/components/ui/controls";
import { ConfirmDialog, Modal } from "@/components/ui/dialog";

const JABATAN_TONE: Record<string, BadgeTone> = {
  Pengasuh: "pine",
  "Guru / Tutor": "sky",
  Konselor: "violet",
  Perawat: "rose",
  Koki: "amber",
  Administrasi: "stone",
  Keamanan: "stone",
  Sopir: "stone",
};

const STATUS_TONE: Record<string, BadgeTone> = {
  Aktif: "emerald",
  Cuti: "amber",
  Nonaktif: "stone",
};

type FormState = {
  nama: string;
  jabatan: string;
  jenisKelamin: string;
  telepon: string;
  email: string;
  alamat: string;
  tanggalBergabung: string;
  status: string;
};

const emptyForm: FormState = {
  nama: "",
  jabatan: "Pengasuh",
  jenisKelamin: "Laki-laki",
  telepon: "",
  email: "",
  alamat: "",
  tanggalBergabung: toDateInput(new Date()),
  status: "Aktif",
};

function toForm(s: StaffMember): FormState {
  return {
    nama: s.nama,
    jabatan: s.jabatan,
    jenisKelamin: s.jenisKelamin,
    telepon: s.telepon ?? "",
    email: s.email ?? "",
    alamat: s.alamat ?? "",
    tanggalBergabung: toDateInput(s.tanggalBergabung),
    status: s.status,
  };
}

export function PengasuhManager({ initialItems }: { initialItems: StaffMember[] }) {
  const [items, setItems] = useState<StaffMember[]>(initialItems);
  const [search, setSearch] = useState("");
  const [filterJabatan, setFilterJabatan] = useState("Semua");
  const [modal, setModal] = useState<{ mode: "create" } | { mode: "edit"; item: StaffMember } | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<StaffMember | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((s) => {
      const matchQuery =
        !q ||
        s.nama.toLowerCase().includes(q) ||
        s.jabatan.toLowerCase().includes(q) ||
        (s.telepon ?? "").toLowerCase().includes(q);
      return matchQuery && (filterJabatan === "Semua" || s.jabatan === filterJabatan);
    });
  }, [items, search, filterJabatan]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving || !modal) return;
    setSaving(true);

    if (modal.mode === "create") {
      const temp: StaffMember = {
        id: `temp-${Date.now()}`,
        nama: form.nama,
        jabatan: form.jabatan,
        jenisKelamin: form.jenisKelamin,
        telepon: form.telepon || null,
        email: form.email || null,
        alamat: form.alamat || null,
        tanggalBergabung: form.tanggalBergabung
          ? new Date(form.tanggalBergabung).toISOString()
          : new Date().toISOString(),
        status: form.status,
        createdAt: new Date().toISOString(),
      };
      setItems((prev) => [...prev, temp].sort((a, b) => a.nama.localeCompare(b.nama)));
      setModal(null);
      try {
        const created = await api<StaffMember>("/api/staff", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setItems((prev) => prev.map((s) => (s.id === temp.id ? created : s)));
        toast.success(`${created.nama} berhasil ditambahkan.`);
      } catch (err) {
        setItems((prev) => prev.filter((s) => s.id !== temp.id));
        toast.error(err instanceof Error ? err.message : "Gagal menambahkan staf.");
      } finally {
        setSaving(false);
      }
      return;
    }

    const target = modal.item;
    const snapshot = items;
    setItems((prev) =>
      prev.map((s) =>
        s.id === target.id
          ? {
              ...s,
              nama: form.nama,
              jabatan: form.jabatan,
              jenisKelamin: form.jenisKelamin,
              telepon: form.telepon || null,
              email: form.email || null,
              alamat: form.alamat || null,
              tanggalBergabung: form.tanggalBergabung
                ? new Date(form.tanggalBergabung).toISOString()
                : s.tanggalBergabung,
              status: form.status,
            }
          : s,
      ),
    );
    setModal(null);
    setPendingId(target.id);
    try {
      const updated = await api<StaffMember>(`/api/staff/${target.id}`, {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      setItems((prev) => prev.map((s) => (s.id === target.id ? updated : s)));
      toast.success("Data staf berhasil diperbarui.");
    } catch (err) {
      setItems(snapshot);
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui data staf.");
    } finally {
      setSaving(false);
      setPendingId(null);
    }
  }

  async function toggleStatus(member: StaffMember) {
    const next = member.status === "Aktif" ? "Nonaktif" : "Aktif";
    const snapshot = items;
    setItems((prev) => prev.map((s) => (s.id === member.id ? { ...s, status: next } : s)));
    setPendingId(member.id);
    try {
      const updated = await api<StaffMember>(`/api/staff/${member.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      setItems((prev) => prev.map((s) => (s.id === member.id ? updated : s)));
      toast.success(`${member.nama} kini berstatus ${next.toLowerCase()}.`);
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
    setItems((prev) => prev.filter((s) => s.id !== target.id));
    try {
      await api(`/api/staff/${target.id}`, { method: "DELETE" });
      toast.success(`${target.nama} telah dihapus.`);
      setDeleting(null);
    } catch (err) {
      setItems(snapshot);
      toast.error(err instanceof Error ? err.message : "Gagal menghapus staf.");
    } finally {
      setDeletingBusy(false);
    }
  }

  const aktifCount = items.filter((s) => s.status === "Aktif").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-pine-950 sm:text-4xl">
            Pengasuh &amp; Staf
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            {aktifCount} dari {items.length} staf sedang aktif melayani anak-anak asuh.
          </p>
        </div>
        <Button
          onClick={() => {
            setForm(emptyForm);
            setModal({ mode: "create" });
          }}
        >
          <Plus className="h-4 w-4" />
          Tambah Staf
        </Button>
      </div>

      {items.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, jabatan, atau nomor telepon..."
              className="pl-10"
            />
          </div>
          <Select
            value={filterJabatan}
            onChange={(e) => setFilterJabatan(e.target.value)}
            className="sm:w-52"
          >
            <option value="Semua">Semua Jabatan</option>
            {JABATAN_STAF.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </Select>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Belum ada pengasuh terdaftar"
          description="Tambahkan pengasuh, guru, perawat, dan staf pendukung yang bekerja di panti."
          action={
            <Button
              onClick={() => {
                setForm(emptyForm);
                setModal({ mode: "create" });
              }}
            >
              <UserRoundPlus className="h-4 w-4" />
              Tambah Staf Pertama
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Tidak ada hasil yang cocok"
          description="Coba kata kunci lain atau reset filter jabatan."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setFilterJabatan("Semua");
              }}
            >
              Hapus Filter
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence initial={false}>
            {filtered.map((s) => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: pendingId === s.id ? 0.6 : 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="group flex flex-col rounded-3xl border border-stone-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-md hover:shadow-pine-900/5"
              >
                <div className="flex items-start gap-3">
                  <Avatar name={s.nama} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-stone-800">{s.nama}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <Badge tone={JABATAN_TONE[s.jabatan] ?? "stone"}>{s.jabatan}</Badge>
                      <Badge tone={STATUS_TONE[s.status] ?? "stone"} dot>
                        {s.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-stone-500">
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-stone-400" />
                    {s.telepon ?? "—"}
                  </p>
                  <p className="flex items-center gap-2 truncate">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                    <span className="truncate">{s.email ?? "—"}</span>
                  </p>
                  <p className="pt-1 text-[11px] text-stone-400">
                    Bergabung {formatDateShort(s.tanggalBergabung)}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-1.5 border-t border-stone-100 pt-3.5">
                  <button
                    onClick={() => toggleStatus(s)}
                    disabled={pendingId === s.id}
                    className="mr-auto inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 transition hover:text-pine-700 disabled:opacity-50"
                    title={s.status === "Aktif" ? "Nonaktifkan" : "Aktifkan"}
                  >
                    {s.status === "Aktif" ? (
                      <ToggleRight className="h-5.5 w-5.5 text-pine-600" />
                    ) : (
                      <ToggleLeft className="h-5.5 w-5.5 text-stone-300" />
                    )}
                    {s.status === "Aktif" ? "Aktif" : "Nonaktif"}
                  </button>
                  <Button size="icon" variant="ghost" onClick={() => { setForm(toForm(s)); setModal({ mode: "edit", item: s }); }} aria-label={`Ubah ${s.nama}`}>
                    <PencilLine className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hover:bg-rose-50 hover:text-rose-600"
                    onClick={() => setDeleting(s)}
                    aria-label={`Hapus ${s.nama}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal
        open={modal !== null}
        onClose={() => !saving && setModal(null)}
        title={modal?.mode === "edit" ? "Ubah Data Staf" : "Tambah Pengasuh / Staf"}
        description={
          modal?.mode === "edit" ? `Perbarui data ${modal.item.nama}.` : "Lengkapi profil staf baru."
        }
        size="lg"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nama Lengkap & Gelar" required className="sm:col-span-2">
            <Input
              required
              value={form.nama}
              onChange={(e) => set("nama", e.target.value)}
              placeholder="cth. Siti Maryam, S.Pd."
            />
          </Field>
          <Field label="Jabatan" required>
            <Select value={form.jabatan} onChange={(e) => set("jabatan", e.target.value)}>
              {JABATAN_STAF.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>
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
          <Field label="No. Telepon">
            <Input
              value={form.telepon}
              onChange={(e) => set("telepon", e.target.value)}
              placeholder="cth. 0812-2745-8890"
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="cth. maryam@nurkasih.or.id"
            />
          </Field>
          <Field label="Alamat" className="sm:col-span-2">
            <Input
              value={form.alamat}
              onChange={(e) => set("alamat", e.target.value)}
              placeholder="cth. Tirtonirmolo, Bantul"
            />
          </Field>
          <Field label="Tanggal Bergabung" required>
            <Input
              type="date"
              required
              value={form.tanggalBergabung}
              onChange={(e) => set("tanggalBergabung", e.target.value)}
            />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
              {STATUS_STAF.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex justify-end gap-2.5 pt-1 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={() => setModal(null)} disabled={saving}>
              Batal
            </Button>
            <Button type="submit" loading={saving}>
              {modal?.mode === "edit" ? "Simpan Perubahan" : "Tambah Staf"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deletingBusy}
        title="Hapus Data Staf"
        description={`Yakin ingin menghapus ${deleting?.nama ?? "staf ini"} dari daftar pengasuh & staf? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
