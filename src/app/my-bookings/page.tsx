"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/src/lib/supabase/client";
import { useRouter } from "next/navigation";

type Booking = {
  id: string;
  pickup_date: string;
  payment_status: string;
  return_date: string;
  total_amount: number;
  status: string;
  cars: {
    name: string;
    brand: string;
    model: string;
  }[];
};

function getStatusStyle(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "border-slate-200 bg-slate-50 text-[#0B1F3A]";

    case "CANCELLED":
      return "border-red-100 bg-red-50 text-red-700";

    default:
      return "border-amber-100 bg-amber-50 text-amber-700";
  }
}

function getPaymentStyle(paymentStatus: string) {
  switch (paymentStatus) {
    case "PAID":
      return "border-slate-200 bg-slate-50 text-[#0B1F3A]";

    case "FAILED":
      return "border-red-100 bg-red-50 text-red-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadBookings() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          pickup_date,
          return_date,
          total_amount,
          status,
          payment_status,
          cars (
            name,
            brand,
            model
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("MY BOOKINGS ERROR:", error);
      }

      setBookings(data || []);
      setLoading(false);
    }

    loadBookings();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-[#F5F8FC]">
        <div className="text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-[#0B1F3A]" />

          <p className="mt-4 text-sm text-slate-500">
            Loading bookings...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F8FC]">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8 lg:px-10 lg:py-14">

        {/* Header */}
        <div className="mb-10">

          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-[#0B1F3A]"
          >
            ← Back to cars
          </Link>

          <div className="mt-8">
            <p className="text-xs font-medium tracking-[0.16em] text-slate-400 uppercase">
              Your reservations
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#0B1F3A]">
              My Bookings
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
              View your rental reservations, payment status and
              booking details.
            </p>
          </div>

        </div>

        {/* Empty State */}
        {bookings.length === 0 ? (
          <div className="border border-slate-200 bg-white px-6 py-16 text-center sm:px-10">

            <p className="text-xs font-medium tracking-[0.15em] text-slate-400 uppercase">
              No reservations
            </p>

            <h2 className="mt-3 text-2xl font-semibold text-[#0B1F3A]">
              Your booking list is empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              You haven't made any bookings yet. Explore our
              available cars and choose one for your next journey.
            </p>

            <Link
              href="/dashboard"
              className="mt-7 inline-flex rounded-xl bg-[#0B1F3A] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#12345B]"
            >
              Browse Cars
            </Link>

          </div>
        ) : (
          <div className="space-y-5">

            {bookings.map((booking) => (
              <article
                key={booking.id}
                className="border border-slate-200 bg-white transition hover:border-slate-300"
              >

                {/* Top */}
                <div className="flex flex-col justify-between gap-5 border-b border-slate-200 p-6 sm:flex-row sm:items-start sm:p-7">

                  <div>
                    <p className="text-xs font-medium tracking-[0.14em] text-slate-400 uppercase">
                      Rental Car
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#0B1F3A]">
                      {booking.cars?.[0]?.brand}{" "}
                      {booking.cars?.[0]?.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {booking.cars?.[0]?.model}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex flex-wrap gap-2 sm:justify-end">

                    <span
                      className={`border px-3 py-1.5 text-[11px] font-semibold tracking-wide ${getStatusStyle(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>

                    <span
                      className={`border px-3 py-1.5 text-[11px] font-semibold tracking-wide ${getPaymentStyle(
                        booking.payment_status
                      )}`}
                    >
                      {booking.payment_status}
                    </span>

                  </div>

                </div>

                {/* Details */}
                <div className="grid sm:grid-cols-3">

                  <div className="border-b border-slate-200 p-6 sm:border-b-0 sm:border-r sm:p-7">
                    <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                      Pickup
                    </p>

                    <p className="mt-2 text-sm font-semibold text-[#0B1F3A]">
                      {booking.pickup_date}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Rental start
                    </p>
                  </div>

                  <div className="border-b border-slate-200 p-6 sm:border-b-0 sm:border-r sm:p-7">
                    <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                      Return
                    </p>

                    <p className="mt-2 text-sm font-semibold text-[#0B1F3A]">
                      {booking.return_date}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Rental end
                    </p>
                  </div>

                  <div className="p-6 sm:p-7">
                    <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                      Total
                    </p>

                    <p className="mt-2 text-xl font-semibold text-[#0B1F3A]">
                      RM {Number(booking.total_amount).toFixed(2)}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Rental amount
                    </p>
                  </div>

                </div>

                {/* Action */}
                <div className="border-t border-slate-200 p-5 sm:p-6">

                  <Link
                    href={`/booking/${booking.id}`}
                    className="flex items-center justify-between rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-[#0B1F3A] transition hover:border-[#0B1F3A] hover:bg-slate-50"
                  >
                    <span>View booking details</span>

                    <span className="transition-transform duration-300 hover:translate-x-1">
                      →
                    </span>
                  </Link>

                </div>

              </article>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}