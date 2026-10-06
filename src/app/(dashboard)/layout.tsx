import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSessionUser } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/shell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser().catch(() => null);
  if (!user) redirect("/login");

  return (
    <DashboardShell
      user={{ id: user.id, name: user.name, email: user.email, role: user.role }}
    >
      {children}
    </DashboardShell>
  );
}
