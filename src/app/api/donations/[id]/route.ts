import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { donations } from "@/db/schema";
import { badRequest, date, notFound, num, requireUser, serverError, str, unauthorized } from "@/lib/api";
import { JENIS_DONASI } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return unauthorized();
  try {
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const update: Partial<typeof donations.$inferInsert> = {};

    if ("namaDonatur" in body) {
      const v = str(body.namaDonatur);
      if (!v) return badRequest("Nama donatur wajib diisi.");
      update.namaDonatur = v;
    }
    if ("jenis" in body) {
      const v = str(body.jenis);
      if (!v || !JENIS_DONASI.includes(v)) return badRequest("Jenis donasi tidak valid.");
      update.jenis = v;
      if (v === "Uang") update.barang = null;
      else update.jumlah = null;
    }
    if ("jumlah" in body) {
      const v = num(body.jumlah);
      if (v !== null && v < 0) return badRequest("Nominal tidak valid.");
      update.jumlah = v;
    }
    if ("barang" in body) update.barang = str(body.barang);
    if ("tanggal" in body) update.tanggal = date(body.tanggal) ?? new Date();
    if ("catatan" in body) update.catatan = str(body.catatan);

    const [row] = await db.update(donations).set(update).where(eq(donations.id, id)).returning();
    if (!row) return notFound();
    if (row.jenis === "Uang" && (!row.jumlah || row.jumlah <= 0)) {
      return badRequest("Nominal donasi uang harus lebih dari nol.");
    }
    if (row.jenis !== "Uang" && !row.barang) {
      return badRequest("Uraikan barang/sembako yang didonasikan.");
    }
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
    const [row] = await db.delete(donations).where(eq(donations.id, id)).returning();
    if (!row) return notFound();
    return NextResponse.json({ ok: true });
  } catch {
    return serverError();
  }
}
