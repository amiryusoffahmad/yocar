"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/src/lib/supabase/client";
import { useRouter } from "next/navigation";

type Booking = {
  id: string;
  pickup_date: string;
  return_date: string;
  created_at: string;
  total_amount: number;
  status: string;
  payment_status?: string;
  cars: {
    name: string;
    brand: string;
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

function getPaymentStyle(status: string) {
  switch (status) {
    case "PAID":
      return "border-slate-200 bg-slate-50 text-[#0B1F3A]";

    case "FAILED":
      return "border-red-100 bg-red-50 text-red-700";

    default:
      return "border-slate-200 bg-white text-slate-500";
  }
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [carFilter, setCarFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");

  const router = useRouter();

  async function loadBookings() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        pickup_date,
        return_date,
        created_at,
        total_amount,
        status,
        payment_status,
        cars (
          name,
          brand
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("LOAD BOOKINGS ERROR:", error);
    }

    setBookings(data || []);
    setLoading(false);
  }

  useEffect(() => {
    async function checkAdmin() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || profile?.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      await loadBookings();
    }

    checkAdmin();
  }, [router]);

  async function updateStatus(
    bookingId: string,
    status: "CONFIRMED" | "CANCELLED"
  ) {
    setUpdating(bookingId);

    const supabase = createClient();

    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId);

    if (error) {
      console.error("UPDATE BOOKING ERROR:", error);
      alert(`Update failed: ${error.message}`);
      setUpdating(null);
      return;
    }

    await loadBookings();
    setUpdating(null);
  }

  /* =========================
     DASHBOARD STATS
  ========================= */

  const pendingBookings = useMemo(
    () =>
      bookings.filter(
        (booking) => booking.status === "PENDING"
      ).length,
    [bookings]
  );

  const confirmedBookings = useMemo(
    () =>
      bookings.filter(
        (booking) => booking.status === "CONFIRMED"
      ).length,
    [bookings]
  );

  const cancelledBookings = useMemo(
    () =>
      bookings.filter(
        (booking) => booking.status === "CANCELLED"
      ).length,
    [bookings]
  );

  const totalRevenue = useMemo(
    () =>
      bookings
        .filter(
          (booking) =>
            booking.payment_status === "PAID"
        )
        .reduce(
          (total, booking) =>
            total + Number(booking.total_amount),
          0
        ),
    [bookings]
  );

  const pendingRevenue = useMemo(
    () =>
      bookings
        .filter(
          (booking) =>
            booking.status === "CONFIRMED" &&
            booking.payment_status !== "PAID"
        )
        .reduce(
          (total, booking) =>
            total + Number(booking.total_amount),
          0
        ),
    [bookings]
  );

  /* =========================
     CAR FILTER OPTIONS
  ========================= */

  const carOptions = Array.from(
    new Set(
      bookings
        .map(
          (booking) =>
            `${booking.cars?.[0]?.brand} ${booking.cars?.[0]?.name}`
        )
        .filter((name) => name !== "undefined undefined")
    )
  );

  /* =========================
     FILTER + SORT
  ========================= */

  const filteredBookings = [...bookings]
    .filter((booking) => {
      const carName =
        `${booking.cars?.[0]?.brand} ${booking.cars?.[0]?.name}`.toLowerCase();

      const searchValue = search
        .toLowerCase()
        .trim();

      const matchesSearch =
        !searchValue ||
        carName.includes(searchValue) ||
        booking.id
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        booking.status === statusFilter;

      const matchesPayment =
        paymentFilter === "ALL" ||
        (booking.payment_status || "UNPAID") ===
          paymentFilter;

      const matchesCar =
        carFilter === "ALL" ||
        carName === carFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment &&
        matchesCar
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "OLDEST":
          return (
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
          );

        case "PICKUP_ASC":
          return (
            new Date(a.pickup_date).getTime() -
            new Date(b.pickup_date).getTime()
          );

        case "PICKUP_DESC":
          return (
            new Date(b.pickup_date).getTime() -
            new Date(a.pickup_date).getTime()
          );

        case "RETURN_ASC":
          return (
            new Date(a.return_date).getTime() -
            new Date(b.return_date).getTime()
          );

        case "RETURN_DESC":
          return (
            new Date(b.return_date).getTime() -
            new Date(a.return_date).getTime()
          );

        case "NEWEST":
        default:
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );
      }
    });

  /* =========================
     CLEAR FILTERS
  ========================= */

  function clearFilters() {
    setSearch("");
    setStatusFilter("ALL");
    setPaymentFilter("ALL");
    setCarFilter("ALL");
    setSortBy("NEWEST");
  }

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-[#F5F8FC]">
        <div className="text-center">

          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-[#0B1F3A]" />

          <p className="mt-4 text-sm text-slate-500">
            Loading dashboard...
          </p>

        </div>
      </main>
    );
  }

  /* =========================
     PAGE
  ========================= */

  return (
    <main className="min-h-screen bg-[#F5F8FC]">

      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10 lg:py-12">

        {/* =========================
            HEADER
        ========================= */}

        <header className="flex flex-col gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <p className="text-xs font-medium tracking-[0.18em] text-slate-400 uppercase">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#0B1F3A] sm:text-4xl">
              Rental Dashboard
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Manage reservations, monitor payments and keep
              track of your rental operations.
            </p>

          </div>

          <Link
            href="/admin/cars"
            className="inline-flex w-fit items-center rounded-xl bg-[#0B1F3A] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#12345B]"
          >
            Manage Cars

            <span className="ml-3 text-base">
              →
            </span>
          </Link>

        </header>

        {/* =========================
            OVERVIEW
        ========================= */}

        <section className="mt-8">

          <div className="mb-4">
            <p className="text-xs font-medium tracking-[0.14em] text-slate-400 uppercase">
              Overview
            </p>
          </div>

          <div className="grid gap-px overflow-hidden border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-5">

            {/* Total */}

            <div className="bg-white p-5 sm:p-6">

              <p className="text-sm text-slate-500">
                Total Bookings
              </p>

              <p className="mt-3 text-3xl font-semibold tracking-tight text-[#0B1F3A]">
                {bookings.length}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                All reservations
              </p>

            </div>

            {/* Pending */}

            <div className="bg-white p-5 sm:p-6">

              <p className="text-sm text-slate-500">
                Pending
              </p>

              <p className="mt-3 text-3xl font-semibold tracking-tight text-[#0B1F3A]">
                {pendingBookings}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Need your attention
              </p>

            </div>

            {/* Confirmed */}

            <div className="bg-white p-5 sm:p-6">

              <p className="text-sm text-slate-500">
                Confirmed
              </p>

              <p className="mt-3 text-3xl font-semibold tracking-tight text-[#0B1F3A]">
                {confirmedBookings}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Active reservations
              </p>

            </div>

            {/* Revenue */}

            <div className="bg-white p-5 sm:p-6">

              <p className="text-sm text-slate-500">
                Paid Revenue
              </p>

              <p className="mt-3 text-2xl font-semibold tracking-tight text-[#0B1F3A]">
                RM {totalRevenue.toFixed(2)}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Completed payments
              </p>

            </div>

            {/* Awaiting */}

            <div className="bg-white p-5 sm:p-6">

              <p className="text-sm text-slate-500">
                Awaiting Payment
              </p>

              <p className="mt-3 text-2xl font-semibold tracking-tight text-[#0B1F3A]">
                RM {pendingRevenue.toFixed(2)}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Confirmed but unpaid
              </p>

            </div>

          </div>

        </section>

        {/* =========================
            BOOKINGS
        ========================= */}

        <section className="mt-12">

          {/* Section header */}

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-xs font-medium tracking-[0.14em] text-slate-400 uppercase">
                Reservations
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#0B1F3A]">
                Recent Bookings
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Review and manage your customer reservations.
              </p>

            </div>

            <div className="text-sm text-slate-400">
              {filteredBookings.length}{" "}
              {filteredBookings.length === 1
                ? "booking"
                : "bookings"}
            </div>

          </div>

          {/* =========================
              FILTERS
          ========================= */}

          <div className="mb-6 border border-slate-200 bg-white p-4 sm:p-5">

            <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">

              {/* Search */}

              <input
                type="text"
                placeholder="Search car or booking ID..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#0B1F3A] outline-none transition placeholder:text-slate-400 focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#0B1F3A]/10"
              />

              {/* Status */}

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#0B1F3A] outline-none focus:border-[#0B1F3A]"
              >
                <option value="ALL">
                  All Status
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="CONFIRMED">
                  Confirmed
                </option>

                <option value="CANCELLED">
                  Cancelled
                </option>
              </select>

              {/* Payment */}

              <select
                value={paymentFilter}
                onChange={(e) =>
                  setPaymentFilter(e.target.value)
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#0B1F3A] outline-none focus:border-[#0B1F3A]"
              >
                <option value="ALL">
                  All Payments
                </option>

                <option value="UNPAID">
                  Unpaid
                </option>

                <option value="PAID">
                  Paid
                </option>

                <option value="FAILED">
                  Failed
                </option>
              </select>

              {/* Car */}

              <select
                value={carFilter}
                onChange={(e) =>
                  setCarFilter(e.target.value)
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#0B1F3A] outline-none focus:border-[#0B1F3A]"
              >
                <option value="ALL">
                  All Cars
                </option>

                {carOptions.map((car) => (
                  <option
                    key={car}
                    value={car}
                  >
                    {car}
                  </option>
                ))}
              </select>

              {/* Sort */}

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#0B1F3A] outline-none focus:border-[#0B1F3A]"
              >
                <option value="NEWEST">
                  Newest Booking
                </option>

                <option value="OLDEST">
                  Oldest Booking
                </option>

                <option value="PICKUP_ASC">
                  Pickup: Earliest
                </option>

                <option value="PICKUP_DESC">
                  Pickup: Latest
                </option>

                <option value="RETURN_ASC">
                  Return: Earliest
                </option>

                <option value="RETURN_DESC">
                  Return: Latest
                </option>
              </select>

            </div>

            {/* Filter footer */}

            <div className="mt-4 flex flex-col gap-3 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

              <p>
                Showing{" "}
                <span className="font-semibold text-slate-600">
                  {filteredBookings.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-600">
                  {bookings.length}
                </span>{" "}
                bookings
              </p>

              {(search ||
                statusFilter !== "ALL" ||
                paymentFilter !== "ALL" ||
                carFilter !== "ALL" ||
                sortBy !== "NEWEST") && (
                <button
                  onClick={clearFilters}
                  className="w-fit font-medium text-[#0B1F3A] transition hover:underline"
                >
                  Clear filters
                </button>
              )}

            </div>

          </div>

          {/* =========================
              EMPTY DATABASE
          ========================= */}

          {bookings.length === 0 ? (

            <div className="border border-slate-200 bg-white px-6 py-16 text-center">

              <p className="text-xs font-medium tracking-[0.14em] text-slate-400 uppercase">
                Reservations
              </p>

              <h3 className="mt-3 text-xl font-semibold text-[#0B1F3A]">
                No bookings yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                New customer bookings will automatically
                appear here.
              </p>

            </div>

          ) : filteredBookings.length === 0 ? (

            /* =========================
               NO FILTER RESULTS
            ========================= */

            <div className="border border-slate-200 bg-white px-6 py-16 text-center">

              <p className="text-xs font-medium tracking-[0.14em] text-slate-400 uppercase">
                No Results
              </p>

              <h3 className="mt-3 text-xl font-semibold text-[#0B1F3A]">
                No bookings match your filters
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Try changing your search or filter options.
              </p>

              <button
                onClick={clearFilters}
                className="mt-6 rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#12345B]"
              >
                Clear Filters
              </button>

            </div>

          ) : (

            /* =========================
               BOOKING TABLE
            ========================= */

            <div className="overflow-hidden border border-slate-200 bg-white">

              {/* Desktop heading */}

              <div className="hidden border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs font-medium tracking-wide text-slate-400 uppercase lg:grid lg:grid-cols-[1.6fr_1fr_1fr_0.8fr_1fr] lg:gap-6">

                <span>
                  Vehicle
                </span>

                <span>
                  Rental Period
                </span>

                <span>
                  Status
                </span>

                <span>
                  Total
                </span>

                <span>
                  Action
                </span>

              </div>

              {/* Booking rows */}

              <div>

                {filteredBookings.map((booking) => (

                  <div
                    key={booking.id}
                    className="border-b border-slate-200 p-6 last:border-b-0 lg:grid lg:grid-cols-[1.6fr_1fr_1fr_0.8fr_1fr] lg:items-center lg:gap-6 lg:px-6 lg:py-5"
                  >

                    {/* Vehicle */}

                    <div>

                      <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                        Vehicle
                      </p>

                      <h3 className="mt-1 font-semibold text-[#0B1F3A]">
                        {booking.cars?.[0]?.brand}{" "}
                        {booking.cars?.[0]?.name}
                      </h3>

                      <p className="mt-1 truncate text-[11px] text-slate-400">
                        Booking ID: {booking.id}
                      </p>

                    </div>

                    {/* Rental Period */}

                    <div className="mt-5 lg:mt-0">

                      <p className="text-xs font-medium tracking-wide text-slate-400 uppercase lg:hidden">
                        Rental Period
                      </p>

                      <div className="mt-1 lg:mt-0">

                        <p className="text-sm font-medium text-slate-700">
                          {booking.pickup_date}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          to
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {booking.return_date}
                        </p>

                      </div>

                    </div>

                    {/* Status */}

                    <div className="mt-5 lg:mt-0">

                      <p className="text-xs font-medium tracking-wide text-slate-400 uppercase lg:hidden">
                        Status
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2 lg:mt-0">

                        <span
                          className={`inline-flex border px-2.5 py-1 text-[11px] font-semibold ${getStatusStyle(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>

                        <span
                          className={`inline-flex border px-2.5 py-1 text-[11px] font-semibold ${getPaymentStyle(
                            booking.payment_status ||
                              "UNPAID"
                          )}`}
                        >
                          {booking.payment_status ||
                            "UNPAID"}
                        </span>

                      </div>

                    </div>

                    {/* Total */}

                    <div className="mt-5 lg:mt-0">

                      <p className="text-xs font-medium tracking-wide text-slate-400 uppercase lg:hidden">
                        Total
                      </p>

                      <p className="mt-1 text-base font-semibold text-[#0B1F3A] lg:mt-0">
                        RM{" "}
                        {Number(
                          booking.total_amount
                        ).toFixed(2)}
                      </p>

                    </div>

                    {/* Actions */}

                    <div className="mt-6 lg:mt-0">

                      {booking.status === "PENDING" ? (

                        <div className="flex gap-2">

                          <button
                            onClick={() =>
                              updateStatus(
                                booking.id,
                                "CONFIRMED"
                              )
                            }
                            disabled={
                              updating === booking.id
                            }
                            className="flex-1 rounded-xl bg-[#0B1F3A] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#12345B] disabled:cursor-not-allowed disabled:opacity-50 lg:flex-none"
                          >
                            {updating === booking.id
                              ? "Updating..."
                              : "Confirm"}
                          </button>

                          <button
                            onClick={() =>
                              updateStatus(
                                booking.id,
                                "CANCELLED"
                              )
                            }
                            disabled={
                              updating === booking.id
                            }
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Cancel
                          </button>

                        </div>

                      ) : (

                        <span className="text-xs text-slate-400">
                          No action required
                        </span>

                      )}

                    </div>

                  </div>

                ))}

              </div>

            </div>

          )}

        </section>

      </div>

    </main>
  );
}