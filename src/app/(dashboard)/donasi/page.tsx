import { desc } from "drizzle-orm";
import type { Metadata } from "next";
import { db } from "@/db";
import { donations } from "@/db/schema";
import { DonasiManager } from "@/components/managers/donasi-manager";
import type { Donation } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Donasi" };

export default async function DonasiPage() {
  const rows = await db.select().from(donations).orderBy(desc(donations.tanggal));
  const items = JSON.parse(JSON.stringify(rows)) as Donation[];
  return <DonasiManager initialItems={items} />;
}
