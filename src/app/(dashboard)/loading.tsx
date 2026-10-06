import { Skeleton, TableSkeleton } from "@/components/ui/primitives";

export default function Loading() {
  return (
    <div className="space-y-6" aria-label="Memuat halaman">
      <div className="space-y-3">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-[26rem] max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-3xl border border-stone-200/80 bg-white p-5">
            <Skeleton className="h-11 w-11 rounded-2xl" />
            <Skeleton className="mt-4 h-8 w-20" />
            <Skeleton className="mt-2 h-3.5 w-32" />
          </div>
        ))}
      </div>
      <TableSkeleton />
    </div>
  );
}
