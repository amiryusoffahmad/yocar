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
  car_id: string;
};

type Car = {
  name: string;
  brand: string;
  model: string;
  price_per_day: number;
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

export default function BookingPage() {
  const params = useParams();
  const bookingId = params.id as string;
  const router = useRouter();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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

      const {
        data: bookingData,
        error: bookingError,
      } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (bookingError) {
        console.error("BOOKING ERROR:", bookingError);
        setErrorMessage(bookingError.message);
        setLoading(false);
        return;
      }

      setBooking(bookingData);

      const {
        data: carData,
        error: carError,
      } = await supabase
        .from("cars")
        .select("name, brand, model, price_per_day")
        .eq("id", bookingData.car_id)
        .single();

      if (carError) {
        console.error("CAR ERROR:", carError);
        setErrorMessage(carError.message);
        setLoading(false);
        return;
      }

      setCar(carData);
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
            Loading booking...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-[#F5F8FC] px-6">
        <div className="w-full max-w-md border border-slate-200 bg-white p-8 text-center">
          <p className="text-xs font-medium tracking-[0.15em] text-slate-400 uppercase">
            Booking
          </p>

          <h1 className="mt-3 text-2xl font-semibold text-[#0B1F3A]">
            Something went wrong
          </h1>

          <p className="mt-3 text-sm leading-6 text-red-600">
            {errorMessage}
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

  if (!booking || !car) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-[#F5F8FC] px-6">
        <div className="w-full max-w-md border border-slate-200 bg-white p-8 text-center">
          <p className="text-xs font-medium tracking-[0.15em] text-slate-400 uppercase">
            Booking
          </p>

          <h1 className="mt-3 text-2xl font-semibold text-[#0B1F3A]">
            Booking not found
          </h1>

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

  const rentalDays = Math.max(
    1,
    Math.round(
      (new Date(booking.return_date).getTime() -
        new Date(booking.pickup_date).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  return (
    <main className="min-h-screen bg-[#F5F8FC]">
      <div className="mx-auto max-w-4xl px-6 py-8 sm:px-8 lg:px-10 lg:py-12">

        {/* Back */}
        <Link
          href="/my-bookings"
          className="inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-[#0B1F3A]"
        >
          ← Back to My Bookings
        </Link>

        {/* Header */}
        <div className="mt-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-slate-400 uppercase">
              Booking Details
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#0B1F3A] sm:text-4xl">
              {car.brand} {car.name}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {car.model}
            </p>
          </div>

          <span
            className={`w-fit border px-4 py-2 text-xs font-semibold tracking-wide ${getStatusStyle(
              booking.status
            )}`}
          >
            {booking.status}
          </span>
        </div>

        {/* Main Card */}
        <div className="mt-8 overflow-hidden border border-slate-200 bg-white">

          {/* Car Header */}
          <div className="border-b border-slate-200 p-6 sm:p-8">
            <p className="text-xs font-medium tracking-[0.14em] text-slate-400 uppercase">
              Rental Car
            </p>

            <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-[#0B1F3A]">
                  {car.brand} {car.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {car.model}
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-xs text-slate-400">
                  Price per day
                </p>

                <p className="mt-1 text-xl font-semibold text-[#0B1F3A]">
                  RM {Number(car.price_per_day).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Rental Details */}
          <div className="grid border-b border-slate-200 sm:grid-cols-2">

            <div className="border-b border-slate-200 p-6 sm:border-r sm:p-8">
              <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                Pickup
              </p>

              <p className="mt-2 text-lg font-semibold text-[#0B1F3A]">
                {booking.pickup_date}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Rental start date
              </p>
            </div>

            <div className="border-b border-slate-200 p-6 sm:p-8">
              <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                Return
              </p>

              <p className="mt-2 text-lg font-semibold text-[#0B1F3A]">
                {booking.return_date}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Rental end date
              </p>
            </div>

            <div className="p-6 sm:border-r sm:p-8">
              <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                Duration
              </p>

              <p className="mt-2 text-lg font-semibold text-[#0B1F3A]">
                {rentalDays} {rentalDays === 1 ? "day" : "days"}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Total rental period
              </p>
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                Payment
              </p>

              <span
                className={`mt-2 inline-block border px-3 py-1.5 text-xs font-semibold ${getPaymentStyle(
                  booking.payment_status
                )}`}
              >
                {booking.payment_status}
              </span>
            </div>

          </div>

          {/* Total */}
          <div className="bg-[#F8FAFC] p-6 sm:p-8">

            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                  Total Rental
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {rentalDays} days × RM{" "}
                  {Number(car.price_per_day).toFixed(2)}
                </p>
              </div>

              <p className="text-3xl font-semibold tracking-tight text-[#0B1F3A]">
                RM {Number(booking.total_amount).toFixed(2)}
              </p>
            </div>

          </div>

          {/* Actions */}
          <div className="p-6 sm:p-8">

            {booking.status === "CONFIRMED" &&
              booking.payment_status === "UNPAID" && (
                <Link
                  href={`/payment/${booking.id}`}
                  className="block w-full rounded-xl bg-[#0B1F3A] px-5 py-4 text-center text-sm font-semibold text-white transition hover:bg-[#12345B]"
                >
                  Pay Now — RM{" "}
                  {Number(booking.total_amount).toFixed(2)}
                </Link>
              )}

            {booking.status === "CONFIRMED" &&
              booking.payment_status === "PAID" && (
                <div className="border border-slate-200 bg-slate-50 px-5 py-4 text-center">
                  <p className="text-sm font-semibold text-[#0B1F3A]">
                    Payment Completed
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Your booking has been successfully paid.
                  </p>
                </div>
              )}

            {booking.status === "PENDING" && (
              <div className="border border-amber-100 bg-amber-50 px-5 py-4 text-center">
                <p className="text-sm font-semibold text-amber-700">
                  Waiting for confirmation
                </p>

                <p className="mt-1 text-xs text-amber-600">
                  Your booking is waiting for admin confirmation before payment.
                </p>
              </div>
            )}

            {booking.status === "CANCELLED" && (
              <div className="border border-red-100 bg-red-50 px-5 py-4 text-center">
                <p className="text-sm font-semibold text-red-700">
                  Booking Cancelled
                </p>

                <p className="mt-1 text-xs text-red-600">
                  This booking is no longer active.
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Booking ID */}
        <div className="mt-6 text-center">
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