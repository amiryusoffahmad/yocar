"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Account created successfully. You can now sign in."
    );

    setLoading(false);

    setTimeout(() => {
      router.push("/login");
    }, 1500);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen items-center justify-center px-6 py-10">

        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="mb-8 text-center">
            <Link
              href="/login"
              className="text-2xl font-bold tracking-tight"
            >
              YOCar
            </Link>

            <p className="mt-2 text-sm text-gray-500">
              Create an account and start booking.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">

            <h1 className="text-2xl font-bold">
              Create your account
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              It only takes a few seconds.
            </p>

            <form
              onSubmit={handleRegister}
              className="mt-6 space-y-5"
            >

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-medium"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  minLength={6}
                  required
                  className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Error */}
              {errorMessage && (
                <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                  {errorMessage}
                </div>
              )}

              {/* Success */}
              {message && (
                <div className="rounded-xl bg-green-50 p-3 text-sm text-green-700">
                  {message}
                </div>
              )}

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>

            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-black hover:underline"
              >
                Sign In
              </Link>
            </p>

          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} YOCar
          </p>

        </div>
      </div>
    </main>
  );
}