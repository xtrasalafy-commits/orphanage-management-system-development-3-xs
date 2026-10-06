import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { randomBytes } from "crypto";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";

export { hashPassword, verifyPassword } from "@/lib/password";

export const SESSION_COOKIE = "panti_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type SessionUser = typeof users.$inferSelect;

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessions).values({ id: token, userId, expiresAt });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, token), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0]?.user ?? null;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db
      .delete(sessions)
      .where(eq(sessions.id, token))
      .catch(() => {});
  }
  cookieStore.delete(SESSION_COOKIE);
}
