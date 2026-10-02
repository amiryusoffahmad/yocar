export default function Loading() {
  return (
    <main className="min-h-screen bg-[#F5F8FC]">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">

        {/* Header Skeleton */}
        <div className="mb-10">
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />

          <div className="mt-4 h-10 w-72 animate-pulse rounded-lg bg-slate-200" />

          <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-200" />
        </div>

        {/* Content Skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden border border-slate-200 bg-white"
            >
              {/* Car Image */}
              <div className="aspect-16/10 w-full animate-pulse bg-slate-200" />

              <div className="p-5">

                {/* Brand */}
                <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />

                {/* Car Name */}
                <div className="mt-3 h-6 w-40 animate-pulse rounded bg-slate-200" />

                {/* Specs */}
                <div className="mt-5 flex gap-3">
                  <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
                </div>

                {/* Price */}
                <div className="mt-6 h-7 w-28 animate-pulse rounded bg-slate-200" />

                {/* Button */}
                <div className="mt-5 h-11 w-full animate-pulse rounded-xl bg-slate-200" />

              </div>
            </div>
          ))}

        </div>
      </div>
    </main>
  );
}