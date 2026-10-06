import { desc } from "drizzle-orm";
import type { Metadata } from "next";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { KegiatanManager } from "@/components/managers/kegiatan-manager";
import type { Activity } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Kegiatan" };

export default async function KegiatanPage() {
  const rows = await db.select().from(activities).orderBy(desc(activities.tanggal));
  const items = JSON.parse(JSON.stringify(rows)) as Activity[];
  return <KegiatanManager initialItems={items} />;
}
