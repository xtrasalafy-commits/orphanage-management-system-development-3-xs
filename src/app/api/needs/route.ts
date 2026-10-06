import { NextResponse, type NextRequest } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { needs } from "@/db/schema";
import { badRequest, date, num, requireUser, serverError, str, unauthorized } from "@/lib/api";
import { KATEGORI_KEBUTUHAN, PRIORITAS, STATUS_KEBUTUHAN } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();
  try {
    const rows = await db.select().from(needs).orderBy(asc(needs.createdAt));
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
    if (!nama) return badRequest("Nama kebutuhan wajib diisi.");
    const kategori = str(body.kategori);
    if (!kategori || !KATEGORI_KEBUTUHAN.includes(kategori)) return badRequest("Kategori tidak valid.");
    const prioritas = str(body.prioritas);
    if (prioritas && !PRIORITAS.includes(prioritas)) return badRequest("Prioritas tidak valid.");
    const status = str(body.status);
    if (status && !STATUS_KEBUTUHAN.includes(status)) return badRequest("Status tidak valid.");
    const jumlah = num(body.jumlah) ?? 1;
    if (jumlah <= 0) return badRequest("Jumlah harus lebih dari nol.");
    const estimasiBiaya = num(body.estimasiBiaya);
    if (estimasiBiaya !== null && estimasiBiaya < 0) return badRequest("Estimasi biaya tidak valid.");

    const [row] = await db
      .insert(needs)
      .values({
        nama,
        kategori,
        jumlah,
        satuan: str(body.satuan) ?? "unit",
        prioritas: prioritas ?? "Sedang",
        status: status ?? "Dibutuhkan",
        estimasiBiaya,
        tanggalDibutuhkan: date(body.tanggalDibutuhkan),
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch {
    return serverError();
  }
}
