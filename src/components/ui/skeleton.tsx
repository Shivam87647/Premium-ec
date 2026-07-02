import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "line" | "circle" | "card" | "image";
}

export function Skeleton({ className, variant = "line" }: SkeletonProps) {
  const variantClasses = {
    line: "h-4 w-full rounded-md",
    circle: "h-12 w-12 rounded-full",
    card: "h-48 w-full rounded-xl",
    image: "aspect-[4/5] w-full rounded-xl",
  };

  return (
    <div
      className={cn(
        "skeleton-shimmer",
        variantClasses[variant],
        className
      )}
      aria-hidden="true"
    />
  );
}

/* Pre-built skeleton layouts for common patterns */

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton variant="image" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4" />
        </td>
      ))}
    </tr>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="card-base p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton variant="circle" className="h-8 w-8" />
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}
