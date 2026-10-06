import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { avatarTone, cn, initials } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Badge                                                               */
/* ------------------------------------------------------------------ */

export type BadgeTone = "pine" | "amber" | "rose" | "sky" | "violet" | "stone" | "emerald";

const badgeTones: Record<BadgeTone, string> = {
  pine: "bg-pine-100 text-pine-800",
  amber: "bg-amber-100 text-amber-800",
  rose: "bg-rose-100 text-rose-700",
  sky: "bg-sky-100 text-sky-700",
  violet: "bg-violet-100 text-violet-700",
  stone: "bg-stone-100 text-stone-600",
  emerald: "bg-emerald-100 text-emerald-700",
};

const dotTones: Record<BadgeTone, string> = {
  pine: "bg-pine-600",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  stone: "bg-stone-400",
  emerald: "bg-emerald-500",
};

export function Badge({
  tone = "stone",
  children,
  dot = false,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap",
        badgeTones[tone],
        className,
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotTones[tone])} />}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Avatar                                                              */
/* ------------------------------------------------------------------ */

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "h-8 w-8 text-[11px] rounded-xl",
    md: "h-10 w-10 text-xs rounded-xl",
    lg: "h-12 w-12 text-sm rounded-2xl",
  };
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center bg-gradient-to-br font-bold tracking-wide text-white",
        avatarTone(name),
        sizes[size],
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Empty state                                                         */
/* ------------------------------------------------------------------ */

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-stone-200 bg-white/60 px-8 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pine-100 text-pine-700">
        <Icon className="h-7 w-7" strokeWidth={1.7} />
      </div>
      <h3 className="font-display text-lg font-semibold text-pine-950">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-stone-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton                                                            */
/* ------------------------------------------------------------------ */

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "skeleton-shimmer relative overflow-hidden rounded-xl bg-pine-950/[0.06]",
        className,
      )}
    />
  );
}

export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white">
      <div className="border-b border-stone-100 px-6 py-4">
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="divide-y divide-stone-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-6 px-6 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            {Array.from({ length: columns - 2 }).map((__, c) => (
              <Skeleton key={c} className="hidden h-3.5 w-20 md:block" />
            ))}
            <Skeleton className="ml-auto h-8 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="rounded-3xl border border-stone-200/80 bg-white p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="mt-4 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-2/3" />
          <Skeleton className="mt-5 h-8 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}
