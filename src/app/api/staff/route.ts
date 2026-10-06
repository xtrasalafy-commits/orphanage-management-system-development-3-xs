import { NextResponse, type NextRequest } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { staff } from "@/db/schema";
import { badRequest, date, requireUser, serverError, str, unauthorized } from "@/lib/api";
import { JABATAN_STAF, JENIS_KELAMIN, STATUS_STAF } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();
  try {
    const rows = await db.select().from(staff).orderBy(asc(staff.nama));
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
    if (!nama) return badRequest("Nama staf wajib diisi.");
    const jabatan = str(body.jabatan);
    if (!jabatan || !JABATAN_STAF.includes(jabatan)) return badRequest("Jabatan tidak valid.");
    const jenisKelamin = str(body.jenisKelamin);
    if (!jenisKelamin || !JENIS_KELAMIN.includes(jenisKelamin)) return badRequest("Jenis kelamin tidak valid.");
    const status = str(body.status);
    if (status && !STATUS_STAF.includes(status)) return badRequest("Status tidak valid.");

    const [row] = await db
      .insert(staff)
      .values({
        nama,
        jabatan,
        jenisKelamin,
        telepon: str(body.telepon),
        email: str(body.email),
        alamat: str(body.alamat),
        tanggalBergabung: date(body.tanggalBergabung) ?? new Date(),
        status: status ?? "Aktif",
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch {
    return serverError();
  }
}
