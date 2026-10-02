"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-xl font-bold">
          !
        </div>

        <h1 className="mt-5 text-2xl font-bold">
          Something went wrong
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          We couldn't load this page. Please try again.
        </p>

        <button
          onClick={() => reset()}
          className="mt-6 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}