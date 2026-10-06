import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { needs } from "@/db/schema";
import { badRequest, date, notFound, num, requireUser, serverError, str, unauthorized } from "@/lib/api";
import { KATEGORI_KEBUTUHAN, PRIORITAS, STATUS_KEBUTUHAN } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return unauthorized();
  try {
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const update: Partial<typeof needs.$inferInsert> = {};

    if ("nama" in body) {
      const v = str(body.nama);
      if (!v) return badRequest("Nama kebutuhan wajib diisi.");
      update.nama = v;
    }
    if ("kategori" in body) {
      const v = str(body.kategori);
      if (!v || !KATEGORI_KEBUTUHAN.includes(v)) return badRequest("Kategori tidak valid.");
      update.kategori = v;
    }
    if ("prioritas" in body) {
      const v = str(body.prioritas);
      if (!v || !PRIORITAS.includes(v)) return badRequest("Prioritas tidak valid.");
      update.prioritas = v;
    }
    if ("status" in body) {
      const v = str(body.status);
      if (!v || !STATUS_KEBUTUHAN.includes(v)) return badRequest("Status tidak valid.");
      update.status = v;
    }
    if ("jumlah" in body) {
      const v = num(body.jumlah);
      if (!v || v <= 0) return badRequest("Jumlah harus lebih dari nol.");
      update.jumlah = v;
    }
    if ("satuan" in body) update.satuan = str(body.satuan) ?? "unit";
    if ("estimasiBiaya" in body) {
      const v = num(body.estimasiBiaya);
      if (v !== null && v < 0) return badRequest("Estimasi biaya tidak valid.");
      update.estimasiBiaya = v;
    }
    if ("tanggalDibutuhkan" in body) update.tanggalDibutuhkan = date(body.tanggalDibutuhkan);

    const [row] = await db.update(needs).set(update).where(eq(needs.id, id)).returning();
    if (!row) return notFound();
    return NextResponse.json(row);
  } catch {
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return unauthorized();
  try {
    const { id } = await ctx.params;
    const [row] = await db.delete(needs).where(eq(needs.id, id)).returning();
    if (!row) return notFound();
    return NextResponse.json({ ok: true });
  } catch {
    return serverError();
  }
}
