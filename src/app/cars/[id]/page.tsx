"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Car = {
  id: string;
  name: string;
  brand: string;
  model: string;
  description: string | null;
  price_per_day: number;
  transmission: string | null;
  fuel_type: string | null;
  seats: number | null;
  image_url: string | null;
};

export default function CarDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const carId = params.id as string;

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCar() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("id", carId)
        .single();

      if (error) {
        console.error(error);
      }

      setCar(data);
      setLoading(false);
    }

    if (carId) {
      loadCar();
    }
  }, [carId, router]);

  if (loading) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-[#F5F8FC]">
        <div className="text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-[#0B1F3A]" />

          <p className="mt-4 text-sm text-slate-500">
            Loading car...
          </p>
        </div>
      </main>
    );
  }

  if (!car) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-[#F5F8FC] px-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[#0B1F3A]">
            Car not found
          </h1>

          <Link
            href="/dashboard"
            className="mt-5 inline-block text-sm font-medium text-[#0B1F3A] underline underline-offset-4"
          >
            Back to cars
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F8FC]">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10 lg:py-12">

        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-[#0B1F3A]"
        >
          ← Back to cars
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">

          {/* LEFT — IMAGE */}
          <div>
            <div className="overflow-hidden bg-slate-200">
              {car.image_url ? (
                <img
                  src={car.image_url}
                  alt={car.name}
                  className="h-90 w-full object-cover sm:h-125 lg:h-155"
                />
              ) : (
                <div className="flex h-90 items-center justify-center text-sm text-slate-400 sm:h-125 lg:h-155">
                  No image available
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:sticky lg:top-28">

            {/* Car heading */}
            <div>
              <p className="text-xs font-medium tracking-[0.18em] text-slate-400 uppercase">
                {car.brand}
              </p>

              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#0B1F3A] sm:text-5xl">
                {car.name}
              </h1>

              <p className="mt-2 text-base text-slate-500">
                {car.model}
              </p>
            </div>

            {/* Price */}
            <div className="mt-7 border-y border-slate-200 py-5">
              <p className="text-xs tracking-wide text-slate-400 uppercase">
                Rental price
              </p>

              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-[#0B1F3A]">
                  RM{Number(car.price_per_day).toFixed(0)}
                </span>

                <span className="text-sm text-slate-500">
                  / day
                </span>
              </div>
            </div>

            {/* Description */}
            {car.description && (
              <div className="mt-7">
                <p className="text-sm leading-7 text-slate-600">
                  {car.description}
                </p>
              </div>
            )}

            {/* Specs */}
            <div className="mt-8 grid grid-cols-3 border-y border-slate-200">
              <div className="py-4 pr-4">
                <p className="text-xs text-slate-400">
                  Transmission
                </p>

                <p className="mt-1 text-sm font-medium text-[#0B1F3A]">
                  {car.transmission || "—"}
                </p>
              </div>

              <div className="border-l border-slate-200 px-4 py-4">
                <p className="text-xs text-slate-400">
                  Fuel
                </p>

                <p className="mt-1 text-sm font-medium text-[#0B1F3A]">
                  {car.fuel_type || "—"}
                </p>
              </div>

              <div className="border-l border-slate-200 pl-4 py-4">
                <p className="text-xs text-slate-400">
                  Seats
                </p>

                <p className="mt-1 text-sm font-medium text-[#0B1F3A]">
                  {car.seats || "—"}
                </p>
              </div>
            </div>

            {/* Booking */}
            <BookingForm
              carId={car.id}
              pricePerDay={car.price_per_day}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function BookingForm({
  carId,
  pricePerDay,
}: {
  carId: string;
  pricePerDay: number;
}) {
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");

  const [totalDays, setTotalDays] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  function calculateDays() {
    if (!pickupDate || !returnDate) {
      return;
    }

    const pickup = new Date(pickupDate);
    const returning = new Date(returnDate);

    const difference =
      returning.getTime() - pickup.getTime();

    const days = Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );

    if (days <= 0) {
      setTotalDays(0);
      setTotalAmount(0);
      return;
    }

    setTotalDays(days);
    setTotalAmount(days * pricePerDay);
  }

  async function createBooking() {
    if (!pickupDate || !returnDate) return;

    setChecking(true);
    setMessage("");

    const supabase = createClient();

    const { data, error } = await supabase.rpc("create_booking", {
      p_car_id: carId,
      p_pickup_date: pickupDate,
      p_return_date: returnDate,
    });

    if (error) {
      console.error(error);
      setMessage(error.message);
      setChecking(false);
      return;
    }

    window.location.href = `/booking/${data.id}`;
  }

  async function checkAvailability() {
    if (!pickupDate || !returnDate) {
      setMessage("Please select both dates.");
      return;
    }

    if (returnDate <= pickupDate) {
      setMessage("Return date must be after pickup date.");
      return;
    }

    setChecking(true);
    setAvailable(null);
    setMessage("");

    calculateDays();

    const supabase = createClient();

    const { data, error } = await supabase.rpc(
      "check_car_availability",
      {
        p_car_id: carId,
        p_pickup_date: pickupDate,
        p_return_date: returnDate,
      }
    );

    if (error) {
      console.error(error);
      setMessage("Something went wrong.");
      setChecking(false);
      return;
    }

    setAvailable(data === true);

    if (data === true) {
      setMessage("This car is available!");
    } else {
      setMessage(
        "Sorry, this car is already booked for these dates."
      );
    }

    setChecking(false);
  }

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_40px_rgba(11,31,58,0.06)] sm:p-7">

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.14em] text-slate-400 uppercase">
            Reserve this car
          </p>

          <h2 className="mt-1 text-xl font-semibold text-[#0B1F3A]">
            Select your dates
          </h2>
        </div>

        {totalDays > 0 && (
          <div className="text-right">
            <p className="text-xs text-slate-400">
              Estimated total
            </p>

            <p className="mt-1 text-lg font-semibold text-[#0B1F3A]">
              RM{totalAmount.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {/* Dates */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">

        <div>
          <label className="mb-2 block text-xs font-medium tracking-wide text-slate-500 uppercase">
            Pickup
          </label>

          <input
            type="date"
            value={pickupDate}
            onChange={(e) => {
              setPickupDate(e.target.value);
              setAvailable(null);
              setMessage("");
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-[#0B1F3A] outline-none transition focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#0B1F3A]/10"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium tracking-wide text-slate-500 uppercase">
            Return
          </label>

          <input
            type="date"
            value={returnDate}
            onChange={(e) => {
              setReturnDate(e.target.value);
              setAvailable(null);
              setMessage("");
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-[#0B1F3A] outline-none transition focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#0B1F3A]/10"
          />
        </div>
      </div>

      {/* Summary */}
      {totalDays > 0 && (
        <div className="mt-5 flex items-center justify-between border-y border-slate-100 py-4">
          <span className="text-sm text-slate-500">
            {totalDays} rental {totalDays === 1 ? "day" : "days"}
          </span>

          <span className="text-sm font-semibold text-[#0B1F3A]">
            RM{totalAmount.toFixed(2)}
          </span>
        </div>
      )}

      {/* Check */}
      <button
        onClick={checkAvailability}
        disabled={checking}
        className="mt-6 w-full rounded-xl bg-[#0B1F3A] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#12345B] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {checking ? "Checking availability..." : "Check availability"}
      </button>

      {/* Message */}
      {message && (
        <div
          className={`mt-4 border px-4 py-3 text-sm ${
            available === true
              ? "border-slate-200 bg-slate-50 text-[#0B1F3A]"
              : available === false
              ? "border-red-100 bg-red-50 text-red-700"
              : "border-slate-200 bg-slate-50 text-slate-600"
          }`}
        >
          {message}
        </div>
      )}

      {/* Continue */}
      {available === true && (
        <button
          onClick={createBooking}
          disabled={checking}
          className="mt-3 w-full rounded-xl border border-[#0B1F3A] bg-white px-5 py-3.5 text-sm font-semibold text-[#0B1F3A] transition hover:bg-slate-50 disabled:opacity-50"
        >
          {checking ? "Creating booking..." : "Continue booking →"}
        </button>
      )}

      <p className="mt-4 text-center text-xs leading-5 text-slate-400">
        Your booking will be sent for confirmation after submission.
      </p>
    </div>
  );
}