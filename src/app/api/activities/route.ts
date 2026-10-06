import { NextResponse, type NextRequest } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { badRequest, date, requireUser, serverError, str, unauthorized } from "@/lib/api";
import { JENIS_KEGIATAN, STATUS_KEGIATAN } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();
  try {
    const rows = await db.select().from(activities).orderBy(desc(activities.tanggal));
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
    const nama = str(body.nama);
    if (!nama) return badRequest("Nama kegiatan wajib diisi.");
    const jenis = str(body.jenis);
    if (!jenis || !JENIS_KEGIATAN.includes(jenis)) return badRequest("Jenis kegiatan tidak valid.");
    const tanggal = date(body.tanggal);
    if (!tanggal) return badRequest("Tanggal kegiatan wajib diisi.");
    const status = str(body.status);
    if (status && !STATUS_KEGIATAN.includes(status)) return badRequest("Status tidak valid.");

    const [row] = await db
      .insert(activities)
      .values({
        nama,
        jenis,
        tanggal,
        lokasi: str(body.lokasi),
        deskripsi: str(body.deskripsi),
        penanggungJawab: str(body.penanggungJawab),
        status: status ?? "Terjadwal",
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch {
    return serverError();
  }
}
