import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { children } from "@/db/schema";
import { badRequest, date, notFound, requireUser, serverError, str, unauthorized } from "@/lib/api";
import { JENIS_KELAMIN, STATUS_ANAK, STATUS_REKAM_ANAK } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return unauthorized();
  try {
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const update: Partial<typeof children.$inferInsert> = {};

    if ("nama" in body) {
      const nama = str(body.nama);
      if (!nama) return badRequest("Nama anak wajib diisi.");
      update.nama = nama;
    }
    if ("jenisKelamin" in body) {
      const v = str(body.jenisKelamin);
      if (!v || !JENIS_KELAMIN.includes(v)) return badRequest("Jenis kelamin tidak valid.");
      update.jenisKelamin = v;
    }
    if ("statusAnak" in body) {
      const v = str(body.statusAnak);
      if (!v || !STATUS_ANAK.includes(v)) return badRequest("Status anak tidak valid.");
      update.statusAnak = v;
    }
    if ("status" in body) {
      const v = str(body.status);
      if (!v || !STATUS_REKAM_ANAK.includes(v)) return badRequest("Status rekam tidak valid.");
      update.status = v;
    }
    if ("tempatLahir" in body) update.tempatLahir = str(body.tempatLahir);
    if ("tanggalLahir" in body) update.tanggalLahir = date(body.tanggalLahir);
    if ("tanggalMasuk" in body) update.tanggalMasuk = date(body.tanggalMasuk) ?? new Date();
    if ("pendidikan" in body) update.pendidikan = str(body.pendidikan);
    if ("namaWali" in body) update.namaWali = str(body.namaWali);
    if ("alamatAsal" in body) update.alamatAsal = str(body.alamatAsal);
    if ("kesehatan" in body) update.kesehatan = str(body.kesehatan);
    if ("catatan" in body) update.catatan = str(body.catatan);

    const [row] = await db.update(children).set(update).where(eq(children.id, id)).returning();
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
    const [row] = await db.delete(children).where(eq(children.id, id)).returning();
    if (!row) return notFound();
    return NextResponse.json({ ok: true });
  } catch {
    return serverError();
  }
}
