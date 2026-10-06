import { asc } from "drizzle-orm";
import type { Metadata } from "next";
import { db } from "@/db";
import { staff } from "@/db/schema";
import { PengasuhManager } from "@/components/managers/pengasuh-manager";
import type { StaffMember } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Pengasuh & Staf" };

export default async function PengasuhPage() {
  const rows = await db.select().from(staff).orderBy(asc(staff.nama));
  const items = JSON.parse(JSON.stringify(rows)) as StaffMember[];
  return <PengasuhManager initialItems={items} />;
}
