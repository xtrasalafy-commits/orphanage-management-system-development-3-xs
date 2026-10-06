import { asc } from "drizzle-orm";
import type { Metadata } from "next";
import { db } from "@/db";
import { needs } from "@/db/schema";
import { KebutuhanManager } from "@/components/managers/kebutuhan-manager";
import type { Need } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Kebutuhan Dasar" };

export default async function KebutuhanPage() {
  const rows = await db.select().from(needs).orderBy(asc(needs.createdAt));
  const items = JSON.parse(JSON.stringify(rows)) as Need[];
  return <KebutuhanManager initialItems={items} />;
}
