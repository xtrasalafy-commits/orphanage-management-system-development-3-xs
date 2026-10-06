import { asc } from "drizzle-orm";
import type { Metadata } from "next";
import { db } from "@/db";
import { children } from "@/db/schema";
import { AnakManager } from "@/components/managers/anak-manager";
import type { Child } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Anak Asuh" };

export default async function AnakPage() {
  const rows = await db.select().from(children).orderBy(asc(children.nama));
  const items = JSON.parse(JSON.stringify(rows)) as Child[];
  return <AnakManager initialItems={items} />;
}
