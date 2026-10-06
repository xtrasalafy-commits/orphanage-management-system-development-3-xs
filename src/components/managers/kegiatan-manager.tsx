"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  CheckCheck,
  CircleSlash,
  MapPin,
  PencilLine,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { JENIS_KEGIATAN, STATUS_KEGIATAN } from "@/lib/constants";
import type { Activity } from "@/lib/types";
import { cn, toDateInput } from "@/lib/utils";
import { Badge, EmptyState, type BadgeTone } from "@/components/ui/primitives";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/controls";
import { ConfirmDialog, Modal } from "@/components/ui/dialog";

const JENIS_TONE: Record<string, BadgeTone> = {
  Pendidikan: "sky",
  Kesehatan: "rose",
  Keagamaan: "pine",
  Rekreasi: "amber",
  Keterampilan: "violet",
  Perlindungan: "emerald",
  Lainnya: "stone",
};

const STATUS_TONE: Record<string, BadgeTone> = {
  Terjadwal: "sky",
  Selesai: "pine",
  Dibatalkan: "stone",
};

type FormState = {
  nama: string;
  jenis: string;
  tanggal: string;
  lokasi: string;
  penanggungJawab: string;
  deskripsi: string;
  status: string;
};

const emptyForm: FormState = {
  nama: "",
  jenis: "Pendidikan",
  tanggal: toDateInput(new Date()),
  lokasi: "",
  penanggungJawab: "",
  deskripsi: "",
  status: "Terjadwal",
};

function toForm(a: Activity): FormState {
  return {
    nama: a.nama,
    jenis: a.jenis,
    tanggal: toDateInput(a.tanggal),
    lokasi: a.lokasi ?? "",
    penanggungJawab: a.penanggungJawab ?? "",
    deskripsi: a.deskripsi ?? "",
    status: a.status,
  };
}

export function KegiatanManager({ initialItems }: { initialItems: Activity[] }) {
  const [items, setItems] = useState<Activity[]>(initialItems);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [modal, setModal] = useState<{ mode: "create" } | { mode: "edit"; item: Activity } | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Activity | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((a) => {
        const matchQuery =
          !q ||
          a.nama.toLowerCase().includes(q) ||
          (a.lokasi ?? "").toLowerCase().includes(q) ||
          (a.penanggungJawab ?? "").toLowerCase().includes(q);
        return matchQuery && (filterStatus === "Semua" || a.status === filterStatus);
      })
      .sort((a, b) => {
        if (a.status === "Terjadwal" && b.status !== "Terjadwal") return -1;
        if (a.status !== "Terjadwal" && b.status === "Terjadwal") return 1;
        const ta = new Date(a.tanggal).getTime();
        const tb = new Date(b.tanggal).getTime();
        return a.status === "Terjadwal" ? ta - tb : tb - ta;
      });
  }, [items, search, filterStatus]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function buildPayload() {
    return {
      nama: form.nama,
      jenis: form.jenis,
      tanggal: form.tanggal ? new Date(`${form.tanggal}T09:00:00`).toISOString() : null,
      lokasi: form.lokasi,
      penanggungJawab: form.penanggungJawab,
      deskripsi: form.deskripsi,
      status: form.status,
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving || !modal) return;
    setSaving(true);
    const payload = buildPayload();

    if (modal.mode === "create") {
      const temp: Activity = {
        id: `temp-${Date.now()}`,
        nama: form.nama,
        jenis: form.jenis,
        tanggal: payload.tanggal ?? new Date().toISOString(),
        lokasi: form.lokasi || null,
        penanggungJawab: form.penanggungJawab || null,
        deskripsi: form.deskripsi || null,
        status: form.status,
        createdAt: new Date().toISOString(),
      };
      setItems((prev) => [temp, ...prev]);
      setModal(null);
      try {
        const created = await api<Activity>("/api/activities", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setItems((prev) => prev.map((a) => (a.id === temp.id ? created : a)));
        toast.success("Kegiatan baru berhasil dijadwalkan.");
      } catch (err) {
        setItems((prev) => prev.filter((a) => a.id !== temp.id));
        toast.error(err instanceof Error ? err.message : "Gagal menjadwalkan kegiatan.");
      } finally {
        setSaving(false);
      }
      return;
    }

    const target = modal.item;
    const snapshot = items;
    setItems((prev) =>
      prev.map((a) =>
        a.id === target.id
          ? {
              ...a,
              nama: form.nama,
              jenis: form.jenis,
              tanggal: payload.tanggal ?? a.tanggal,
              lokasi: form.lokasi || null,
              penanggungJawab: form.penanggungJawab || null,
              deskripsi: form.deskripsi || null,
              status: form.status,
            }
          : a,
      ),
    );
    setModal(null);
    setPendingId(target.id);
    try {
      const updated = await api<Activity>(`/api/activities/${target.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setItems((prev) => prev.map((a) => (a.id === target.id ? updated : a)));
      toast.success("Kegiatan berhasil diperbarui.");
    } catch (err) {
      setItems(snapshot);
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui kegiatan.");
    } finally {
      setSaving(false);
      setPendingId(null);
    }
  }

  async function setStatus(activity: Activity, status: string) {
    if (activity.status === status) return;
    const snapshot = items;
    setItems((prev) => prev.map((a) => (a.id === activity.id ? { ...a, status } : a)));
    setPendingId(activity.id);
    try {
      const updated = await api<Activity>(`/api/activities/${activity.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setItems((prev) => prev.map((a) => (a.id === activity.id ? updated : a)));
      toast.success(`"${activity.nama}" ditandai ${status.toLowerCase()}.`);
    } catch (err) {
      setItems(snapshot);
      toast.error(err instanceof Error ? err.message : "Gagal mengubah status kegiatan.");
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete() {
    if (!deleting || deletingBusy) return;
    const target = deleting;
    const snapshot = items;
    setDeletingBusy(true);
    setItems((prev) => prev.filter((a) => a.id !== target.id));
    try {
      await api(`/api/activities/${target.id}`, { method: "DELETE" });
      toast.success("Kegiatan telah dihapus.");
      setDeleting(null);
    } catch (err) {
      setItems(snapshot);
      toast.error(err instanceof Error ? err.message : "Gagal menghapus kegiatan.");
    } finally {
      setDeletingBusy(false);
    }
  }

  const terjadwalCount = items.filter((a) => a.status === "Terjadwal").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-pine-950 sm:text-4xl">Kegiatan</h1>
          <p className="mt-2 text-sm text-stone-500">
            {terjadwalCount} kegiatan terjadwal — pendidikan, kesehatan, rekreasi, hingga program
            perlindungan anak.
          </p>
        </div>
        <Button
          onClick={() => {
            setForm(emptyForm);
            setModal({ mode: "create" });
          }}
        >
          <Plus className="h-4 w-4" />
          Jadwalkan Kegiatan
        </Button>
      </div>

      {items.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama kegiatan, lokasi, atau penanggung jawab..."
              className="pl-10"
            />
          </div>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="sm:w-48"
          >
            <option value="Semua">Semua Status</option>
            {STATUS_KEGIATAN.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Belum ada kegiatan terjadwal"
          description="Jadwalkan kegiatan pertama untuk anak-anak asuh — belajar, bermain, atau program perlindungan."
          action={
            <Button
              onClick={() => {
                setForm(emptyForm);
                setModal({ mode: "create" });
              }}
            >
              <Plus className="h-4 w-4" />
              Jadwalkan Kegiatan
            </Button>
          }
        />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Tidak ada hasil yang cocok"
          description="Coba kata kunci lain atau reset filter status kegiatan."
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence initial={false}>
            {sorted.map((a) => {
              const d = new Date(a.tanggal);
              const valid = !Number.isNaN(d.getTime());
              const selesai = a.status === "Selesai";
              const batal = a.status === "Dibatalkan";
              return (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: pendingId === a.id ? 0.6 : 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "group flex flex-col rounded-3xl border border-stone-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-md hover:shadow-pine-900/5",
                    (selesai || batal) && "opacity-90",
                  )}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={cn(
                        "flex h-13 w-13 shrink-0 flex-col items-center justify-center rounded-2xl text-white",
                        selesai
                          ? "bg-pine-700"
                          : batal
                            ? "bg-stone-400"
                            : "bg-gradient-to-br from-pine-600 to-pine-900",
                      )}
                    >
                      <span className="text-lg leading-none font-bold">
                        {valid ? d.getDate() : "—"}
                      </span>
                      <span className="text-[10px] font-semibold tracking-wide uppercase">
                        {valid
                          ? `${d.toLocaleDateString("id-ID", { month: "short" })} ${d.getFullYear()}`
                          : ""}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-stone-800">{a.nama}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <Badge tone={JENIS_TONE[a.jenis] ?? "stone"}>{a.jenis}</Badge>
                        <Badge tone={STATUS_TONE[a.status] ?? "stone"} dot>
                          {a.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {a.deskripsi && (
                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-stone-500">
                      {a.deskripsi}
                    </p>
                  )}

                  <div className="mt-3 space-y-1.5 text-xs text-stone-500">
                    <p className="flex items-center gap-2 truncate">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                      <span className="truncate">{a.lokasi ?? "Panti Nur Kasih"}</span>
                    </p>
                    <p className="flex items-center gap-2 truncate">
                      <UserRound className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                      <span className="truncate">{a.penanggungJawab ?? "Belum ditentukan"}</span>
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-1.5 border-t border-stone-100 pt-3.5">
                    {a.status === "Terjadwal" ? (
                      <>
                        <button
                          onClick={() => setStatus(a, "Selesai")}
                          disabled={pendingId === a.id}
                          className="mr-auto inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-pine-700 transition hover:bg-pine-50 disabled:opacity-50"
                        >
                          <CheckCheck className="h-4 w-4" />
                          Tandai Selesai
                        </button>
                        <button
                          onClick={() => setStatus(a, "Dibatalkan")}
                          disabled={pendingId === a.id}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-stone-400 transition hover:bg-stone-100 hover:text-stone-600 disabled:opacity-50"
                          title="Batalkan kegiatan"
                        >
                          <CircleSlash className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setStatus(a, "Terjadwal")}
                        disabled={pendingId === a.id}
                        className="mr-auto inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-stone-500 transition hover:bg-stone-100 hover:text-pine-700 disabled:opacity-50"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Jadwalkan Ulang
                      </button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setForm(toForm(a));
                        setModal({ mode: "edit", item: a });
                      }}
                      aria-label="Ubah kegiatan"
                    >
                      <PencilLine className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="hover:bg-rose-50 hover:text-rose-600"
                      onClick={() => setDeleting(a)}
                      aria-label="Hapus kegiatan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Modal
        open={modal !== null}
        onClose={() => !saving && setModal(null)}
        title={modal?.mode === "edit" ? "Ubah Kegiatan" : "Jadwalkan Kegiatan Baru"}
        description="Rencanakan kegiatan untuk anak asuh beserta penanggung jawabnya."
        size="lg"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nama Kegiatan" required className="sm:col-span-2">
            <Input
              required
              value={form.nama}
              onChange={(e) => set("nama", e.target.value)}
              placeholder="cth. Pemeriksaan Kesehatan Rutin"
            />
          </Field>
          <Field label="Jenis Kegiatan" required>
            <Select value={form.jenis} onChange={(e) => set("jenis", e.target.value)}>
              {JENIS_KEGIATAN.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tanggal Pelaksanaan" required>
            <Input
              type="date"
              required
              value={form.tanggal}
              onChange={(e) => set("tanggal", e.target.value)}
            />
          </Field>
          <Field label="Lokasi">
            <Input
              value={form.lokasi}
              onChange={(e) => set("lokasi", e.target.value)}
              placeholder="cth. Aula Panti Nur Kasih"
            />
          </Field>
          <Field label="Penanggung Jawab">
            <Input
              value={form.penanggungJawab}
              onChange={(e) => set("penanggungJawab", e.target.value)}
              placeholder="cth. Siti Maryam, S.Pd."
            />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
              {STATUS_KEGIATAN.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Deskripsi" className="sm:col-span-2">
            <Textarea
              value={form.deskripsi}
              onChange={(e) => set("deskripsi", e.target.value)}
              placeholder="Rincian kegiatan, pihak yang terlibat, target peserta..."
            />
          </Field>
          <div className="flex justify-end gap-2.5 pt-1 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={() => setModal(null)} disabled={saving}>
              Batal
            </Button>
            <Button type="submit" loading={saving}>
              {modal?.mode === "edit" ? "Simpan Perubahan" : "Jadwalkan"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deletingBusy}
        title="Hapus Kegiatan"
        description={`Yakin ingin menghapus kegiatan "${deleting?.nama ?? "ini"}"? Jadwal terkait akan hilang.`}
      />
    </div>
  );
}
