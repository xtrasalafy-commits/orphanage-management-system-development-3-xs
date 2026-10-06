import { NextResponse } from "next/server";
import { getSessionUser, type SessionUser } from "@/lib/auth";

export async function requireUser(): Promise<SessionUser | null> {
  try {
    return await getSessionUser();
  } catch {
    return null;
  }
}

export const unauthorized = () =>
  NextResponse.json({ error: "Sesi Anda telah berakhir. Silakan masuk kembali." }, { status: 401 });

export const badRequest = (message: string) =>
  NextResponse.json({ error: message }, { status: 400 });

export const notFound = (message = "Data tidak ditemukan.") =>
  NextResponse.json({ error: message }, { status: 404 });

export const serverError = () =>
  NextResponse.json({ error: "Terjadi kesalahan pada server. Coba lagi nanti." }, { status: 500 });

/** Body parsing helpers — tolerate nullish input and trim strings. */
export function str(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  return v.length > 0 ? v : null;
}

export function num(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : null;
}

export function date(value: unknown): Date | null {
  const s = str(value);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}
