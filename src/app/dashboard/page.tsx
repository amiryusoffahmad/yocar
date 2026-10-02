"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Car = {
  id: string;
  name: string;
  brand: string;
  model: string;
  price_per_day: number;
  transmission: string;
  fuel_type: string;
  seats: number;
  image_url: string | null;
};

export default function DashboardPage() {
  const router = useRouter();

  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("cars")
        .select("*")
        .eq("is_available", true)
        .order("created_at", {
          ascending: false,
        });

      setCars(data ?? []);
      setLoading(false);
    }

    loadData();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-[#F5F8FC]">
        <div className="text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-[#0B1F3A]" />
          <p className="mt-4 text-sm text-slate-500">
            Finding available cars...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F8FC]">

      {/* Hero */}
      <section className="bg-[#0B1F3A] text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10 lg:py-24">

          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-medium tracking-[0.18em] text-slate-300 uppercase">
              Premium Car Rental
            </p>

            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              The right car
              <br />
              for every journey.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              Choose from our collection of reliable cars and
              book your next journey with ease.
            </p>

            <Link
              href="#cars"
              className="mt-8 inline-flex items-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[#0B1F3A] transition hover:bg-slate-100"
            >
              Explore Cars
              <span className="ml-3">↓</span>
            </Link>
          </div>

        </div>
      </section>

      {/* Cars */}
      <section
        id="cars"
        className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20"
      >

        {/* Section Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium tracking-[0.14em] text-slate-500 uppercase">
              Our Collection
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#0B1F3A]">
              Available Cars
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-6 text-slate-500">
            Find the perfect car for your next trip, from
            everyday drives to weekend getaways.
          </p>
        </div>

        {/* Empty State */}
        {cars.length === 0 ? (
          <div className="border border-slate-200 bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-[#0B1F3A]">
              No cars available
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              There are currently no cars available for booking.
            </p>
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">

            {cars.map((car) => (
              <article
                key={car.id}
                className="group"
              >

                {/* Image */}
                <Link
                  href={`/cars/${car.id}`}
                  className="block overflow-hidden bg-slate-200"
                >
                  {car.image_url ? (
                    <img
                      src={car.image_url}
                      alt={car.name}
                      className="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.03] sm:h-72"
                    />
                  ) : (
                    <div className="flex h-64 items-center justify-center bg-slate-200 text-sm text-slate-400 sm:h-72">
                      No image
                    </div>
                  )}
                </Link>

                {/* Details */}
                <div className="pt-5">

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <p className="text-xs font-medium tracking-[0.12em] text-slate-400 uppercase">
                        {car.brand}
                      </p>

                      <h3 className="mt-1 text-xl font-semibold tracking-tight text-[#0B1F3A]">
                        {car.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {car.model}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs text-slate-400">
                        From
                      </p>

                      <p className="mt-0.5 text-lg font-semibold text-[#0B1F3A]">
                        RM{Number(car.price_per_day).toFixed(0)}
                      </p>

                      <p className="text-xs text-slate-400">
                        / day
                      </p>
                    </div>

                  </div>

                  {/* Specs */}
                  <div className="mt-5 flex items-center gap-4 border-y border-slate-200 py-3 text-xs text-slate-500">
                    <span>{car.transmission}</span>

                    <span className="h-1 w-1 rounded-full bg-slate-300" />

                    <span>{car.fuel_type}</span>

                    <span className="h-1 w-1 rounded-full bg-slate-300" />

                    <span>{car.seats} seats</span>
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/cars/${car.id}`}
                    className="mt-4 flex items-center justify-between text-sm font-semibold text-[#0B1F3A] transition group-hover:text-[#12345B]"
                  >
                    <span>View car</span>

                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>

                </div>
              </article>
            ))}

          </div>
        )}

      </section>
    </main>
  );
}