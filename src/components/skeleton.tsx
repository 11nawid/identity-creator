'use client';

export function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`skeleton h-4 rounded ${className}`} />;
}

export function SkeletonCircle({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-full ${className}`} />;
}

export function IdentityCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
      <div className="flex items-center gap-3">
        <SkeletonCircle className="h-20 w-20" />
        <div className="space-y-2 flex-1">
          <SkeletonLine className="w-1/2 h-5" />
          <SkeletonLine className="w-1/3" />
          <SkeletonLine className="w-2/5" />
        </div>
      </div>
      <div className="space-y-3 pt-4 border-t border-border-subtle">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonLine className="h-4 w-4 rounded" />
            <SkeletonLine className="w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GeneratingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-8 space-y-6">
        <div className="flex flex-col items-center gap-4">
          <SkeletonCircle className="h-24 w-24" />
          <div className="space-y-2 text-center">
            <SkeletonLine className="w-32 h-5 mx-auto" />
            <SkeletonLine className="w-20 mx-auto" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <SkeletonLine className="h-4 w-4 rounded" />
              <SkeletonLine className="flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
