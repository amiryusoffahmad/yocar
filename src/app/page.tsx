import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">
          Car Rental
        </h1>

        <p className="mt-3 text-gray-500">
          Rent your car easily.
        </p>

        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-black px-6 py-3 text-white"
        >
          Browse Cars
        </Link>
      </div>
    </main>
  );
}