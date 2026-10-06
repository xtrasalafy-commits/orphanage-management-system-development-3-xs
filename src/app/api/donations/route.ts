import { NextResponse, type NextRequest } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { donations } from "@/db/schema";
import { badRequest, date, num, requireUser, serverError, str, unauthorized } from "@/lib/api";
import { JENIS_DONASI } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();
  try {
    const rows = await db.select().from(donations).orderBy(desc(donations.tanggal));
    return NextResponse.json(rows);
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) return unauthorized();
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const namaDonatur = str(body.namaDonatur);
    if (!namaDonatur) return badRequest("Nama donatur wajib diisi.");
    const jenis = str(body.jenis);
    if (!jenis || !JENIS_DONASI.includes(jenis)) return badRequest("Jenis donasi tidak valid.");

    const jumlah = num(body.jumlah);
    const barang = str(body.barang);
    if (jenis === "Uang" && (!jumlah || jumlah <= 0)) {
      return badRequest("Nominal donasi uang harus lebih dari nol.");
    }
    if (jenis !== "Uang" && !barang) {
      return badRequest("Uraikan barang/sembako yang didonasikan.");
    }

    const [row] = await db
      .insert(donations)
      .values({
        namaDonatur,
        jenis,
        jumlah: jenis === "Uang" ? jumlah : null,
        barang: jenis === "Uang" ? null : barang,
        tanggal: date(body.tanggal) ?? new Date(),
        catatan: str(body.catatan),
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch {
    return serverError();
  }
}
