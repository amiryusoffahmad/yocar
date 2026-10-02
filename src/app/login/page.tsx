"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
  setErrorMessage(error.message);
  setLoading(false);
  return;
}

const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  setErrorMessage("Unable to get user information.");
  setLoading(false);
  return;
}

const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .single();

if (profileError) {
  console.error("PROFILE ERROR:", profileError);
  setErrorMessage("Unable to load user profile.");
  setLoading(false);
  return;
}

if (profile?.role === "admin") {
  router.push("/admin");
} else {
  router.push("/dashboard");
}
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
              Sign in to manage your car bookings.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">

            <h1 className="text-2xl font-bold">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Enter your details to continue.
            </p>

            <form
              onSubmit={handleLogin}
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
                  placeholder="••••••••"
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

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-black hover:underline"
              >
                Create one
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