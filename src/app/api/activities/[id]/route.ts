import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { badRequest, date, notFound, requireUser, serverError, str, unauthorized } from "@/lib/api";
import { JENIS_KEGIATAN, STATUS_KEGIATAN } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return unauthorized();
  try {
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const update: Partial<typeof activities.$inferInsert> = {};

    if ("nama" in body) {
      const v = str(body.nama);
      if (!v) return badRequest("Nama kegiatan wajib diisi.");
      update.nama = v;
    }
    if ("jenis" in body) {
      const v = str(body.jenis);
      if (!v || !JENIS_KEGIATAN.includes(v)) return badRequest("Jenis kegiatan tidak valid.");
      update.jenis = v;
    }
    if ("tanggal" in body) {
      const v = date(body.tanggal);
      if (!v) return badRequest("Tanggal kegiatan tidak valid.");
      update.tanggal = v;
    }
    if ("status" in body) {
      const v = str(body.status);
      if (!v || !STATUS_KEGIATAN.includes(v)) return badRequest("Status tidak valid.");
      update.status = v;
    }
    if ("lokasi" in body) update.lokasi = str(body.lokasi);
    if ("deskripsi" in body) update.deskripsi = str(body.deskripsi);
    if ("penanggungJawab" in body) update.penanggungJawab = str(body.penanggungJawab);

    const [row] = await db.update(activities).set(update).where(eq(activities.id, id)).returning();
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
    const [row] = await db.delete(activities).where(eq(activities.id, id)).returning();
    if (!row) return notFound();
    return NextResponse.json({ ok: true });
  } catch {
    return serverError();
  }
}
