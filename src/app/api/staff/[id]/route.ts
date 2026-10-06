import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { staff } from "@/db/schema";
import { badRequest, date, notFound, requireUser, serverError, str, unauthorized } from "@/lib/api";
import { JABATAN_STAF, JENIS_KELAMIN, STATUS_STAF } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return unauthorized();
  try {
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const update: Partial<typeof staff.$inferInsert> = {};

    if ("nama" in body) {
      const nama = str(body.nama);
      if (!nama) return badRequest("Nama staf wajib diisi.");
      update.nama = nama;
    }
    if ("jabatan" in body) {
      const v = str(body.jabatan);
      if (!v || !JABATAN_STAF.includes(v)) return badRequest("Jabatan tidak valid.");
      update.jabatan = v;
    }
    if ("jenisKelamin" in body) {
      const v = str(body.jenisKelamin);
      if (!v || !JENIS_KELAMIN.includes(v)) return badRequest("Jenis kelamin tidak valid.");
      update.jenisKelamin = v;
    }
    if ("status" in body) {
      const v = str(body.status);
      if (!v || !STATUS_STAF.includes(v)) return badRequest("Status tidak valid.");
      update.status = v;
    }
    if ("telepon" in body) update.telepon = str(body.telepon);
    if ("email" in body) update.email = str(body.email);
    if ("alamat" in body) update.alamat = str(body.alamat);
    if ("tanggalBergabung" in body) update.tanggalBergabung = date(body.tanggalBergabung) ?? new Date();

    const [row] = await db.update(staff).set(update).where(eq(staff.id, id)).returning();
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
    const [row] = await db.delete(staff).where(eq(staff.id, id)).returning();
    if (!row) return notFound();
    return NextResponse.json({ ok: true });
  } catch {
    return serverError();
  }
}
