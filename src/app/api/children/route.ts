import { NextResponse, type NextRequest } from "next/server";
import { asc, count } from "drizzle-orm";
import { db } from "@/db";
import { children } from "@/db/schema";
import { badRequest, date, requireUser, serverError, str, unauthorized } from "@/lib/api";
import { JENIS_KELAMIN, STATUS_ANAK, STATUS_REKAM_ANAK } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();
  try {
    const rows = await db.select().from(children).orderBy(asc(children.nama));
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
    if (!nama) return badRequest("Nama anak wajib diisi.");
    const jenisKelamin = str(body.jenisKelamin);
    if (!jenisKelamin || !JENIS_KELAMIN.includes(jenisKelamin)) {
      return badRequest("Jenis kelamin tidak valid.");
    }
    const statusAnak = str(body.statusAnak);
    if (statusAnak && !STATUS_ANAK.includes(statusAnak)) return badRequest("Status anak tidak valid.");
    const status = str(body.status);
    if (status && !STATUS_REKAM_ANAK.includes(status)) return badRequest("Status rekam tidak valid.");

    const [{ value: total }] = await db.select({ value: count() }).from(children);
    const kode = `ANK-${(total + 1).toString().padStart(3, "0")}`;

    const [row] = await db
      .insert(children)
      .values({
        kode,
        nama,
        jenisKelamin,
        tempatLahir: str(body.tempatLahir),
        tanggalLahir: date(body.tanggalLahir),
        statusAnak: statusAnak ?? "Yatim",
        tanggalMasuk: date(body.tanggalMasuk) ?? new Date(),
        pendidikan: str(body.pendidikan),
        namaWali: str(body.namaWali),
        alamatAsal: str(body.alamatAsal),
        kesehatan: str(body.kesehatan) ?? "Sehat",
        catatan: str(body.catatan),
        status: status ?? "Aktif",
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch {
    return serverError();
  }
}
