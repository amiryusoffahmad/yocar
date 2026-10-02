"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";

type Booking = {
  id: string;
  pickup_date: string;
  return_date: string;
  total_amount: number;
  status: string;
  payment_status: string;
  cars: {
    name: string;
    brand: string;
    model: string;
  }[];
};

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBooking() {
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
        .eq("id", bookingId)
        .single();

      if (error) {
        console.error("PAYMENT BOOKING ERROR:", error);
      }

      setBooking(data);
      setLoading(false);
    }

    if (bookingId) {
      loadBooking();
    }
  }, [bookingId, router]);

  if (loading) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-[#F5F8FC]">
        <div className="text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-[#0B1F3A]" />

          <p className="mt-4 text-sm text-slate-500">
            Loading payment...
          </p>
        </div>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-[#F5F8FC] px-6">
        <div className="w-full max-w-md border border-slate-200 bg-white p-8 text-center">
          <p className="text-xs font-medium tracking-[0.15em] text-slate-400 uppercase">
            Payment
          </p>

          <h1 className="mt-3 text-2xl font-semibold text-[#0B1F3A]">
            Booking not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            We couldn't find this booking.
          </p>

          <Link
            href="/my-bookings"
            className="mt-7 inline-block rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#12345B]"
          >
            Back to My Bookings
          </Link>
        </div>
      </main>
    );
  }

  if (booking.status !== "CONFIRMED") {
    return (
      <main className="min-h-screen bg-[#F5F8FC]">
        <div className="mx-auto max-w-2xl px-6 py-10 sm:px-8">

          <Link
            href={`/booking/${booking.id}`}
            className="text-sm font-medium text-slate-500 transition hover:text-[#0B1F3A]"
          >
            ← Back to Booking
          </Link>

          <div className="mt-8 border border-slate-200 bg-white p-8 text-center sm:p-12">

            <p className="text-xs font-medium tracking-[0.15em] text-slate-400 uppercase">
              Payment
            </p>

            <h1 className="mt-3 text-2xl font-semibold text-[#0B1F3A]">
              Payment Unavailable
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              Your booking must be confirmed by the admin before
              payment can be completed.
            </p>

            <Link
              href={`/booking/${booking.id}`}
              className="mt-7 inline-block rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#12345B]"
            >
              Back to Booking
            </Link>

          </div>
        </div>
      </main>
    );
  }

  if (booking.payment_status === "PAID") {
    return (
      <main className="min-h-screen bg-[#F5F8FC]">
        <div className="mx-auto max-w-2xl px-6 py-10 sm:px-8">

          <Link
            href={`/booking/${booking.id}`}
            className="text-sm font-medium text-slate-500 transition hover:text-[#0B1F3A]"
          >
            ← Back to Booking
          </Link>

          <div className="mt-8 border border-slate-200 bg-white p-8 text-center sm:p-12">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-[#0B1F3A]">
              ✓
            </div>

            <p className="mt-6 text-xs font-medium tracking-[0.15em] text-slate-400 uppercase">
              Payment
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-[#0B1F3A]">
              Payment Completed
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              This booking has already been paid.
            </p>

            <div className="mt-8 border-y border-slate-200 py-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Total Paid
                </span>

                <span className="text-2xl font-semibold text-[#0B1F3A]">
                  RM {Number(booking.total_amount).toFixed(2)}
                </span>
              </div>
            </div>

            <Link
              href={`/booking/${booking.id}`}
              className="mt-7 block rounded-xl bg-[#0B1F3A] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#12345B]"
            >
              View Booking
            </Link>

          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F8FC]">
      <div className="mx-auto max-w-4xl px-6 py-10 sm:px-8 lg:py-14">

        {/* Back */}
        <Link
          href={`/booking/${booking.id}`}
          className="text-sm font-medium text-slate-500 transition hover:text-[#0B1F3A]"
        >
          ← Back to Booking
        </Link>

        {/* Header */}
        <div className="mt-8">
          <p className="text-xs font-medium tracking-[0.16em] text-slate-400 uppercase">
            Secure Checkout
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#0B1F3A]">
            Complete Payment
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Your booking has been confirmed. Review your reservation
            before proceeding with payment.
          </p>
        </div>

        {/* Checkout */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">

          {/* Booking Summary */}
          <div className="border border-slate-200 bg-white">

            <div className="border-b border-slate-200 p-6 sm:p-7">
              <p className="text-xs font-medium tracking-[0.14em] text-slate-400 uppercase">
                Reservation
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#0B1F3A]">
                {booking.cars?.[0]?.brand}{" "}
                {booking.cars?.[0]?.name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {booking.cars?.[0]?.model}
              </p>
            </div>

            <div className="grid sm:grid-cols-2">

              <div className="border-b border-slate-200 p-6 sm:border-r sm:p-7">
                <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                  Pickup
                </p>

                <p className="mt-2 text-sm font-semibold text-[#0B1F3A]">
                  {booking.pickup_date}
                </p>
              </div>

              <div className="border-b border-slate-200 p-6 sm:p-7">
                <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                  Return
                </p>

                <p className="mt-2 text-sm font-semibold text-[#0B1F3A]">
                  {booking.return_date}
                </p>
              </div>

            </div>

            <div className="p-6 sm:p-7">
              <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                Payment Status
              </p>

              <span className="mt-2 inline-block border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                {booking.payment_status}
              </span>
            </div>

          </div>

          {/* Payment Summary */}
          <div className="h-fit border border-slate-200 bg-white">

            <div className="p-6 sm:p-7">

              <p className="text-xs font-medium tracking-[0.14em] text-slate-400 uppercase">
                Payment Summary
              </p>

              <div className="mt-6 flex items-end justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Total amount
                </span>

                <span className="text-2xl font-semibold text-[#0B1F3A]">
                  RM {Number(booking.total_amount).toFixed(2)}
                </span>
              </div>

              <div className="my-6 border-t border-slate-200" />

              <button
                disabled
                className="w-full rounded-xl bg-[#0B1F3A] px-5 py-3.5 text-sm font-semibold text-white opacity-50"
              >
                Pay RM {Number(booking.total_amount).toFixed(2)}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                Payment gateway integration coming soon.
              </p>

            </div>

          </div>

        </div>

        {/* Booking ID */}
        <div className="mt-7 text-center">
          <p className="text-xs text-slate-400">
            Booking ID
          </p>

          <p className="mt-1 break-all font-mono text-[11px] text-slate-400">
            {booking.id}
          </p>
        </div>

      </div>
    </main>
  );
}