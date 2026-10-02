"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();
    router.push("/login");
  }

  const links = [
    {
      name: "Cars",
      href: "/dashboard",
    },
    {
      name: "My Bookings",
      href: "/my-bookings",
    },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B1F3A] text-sm font-bold text-white">
            Y
          </div>

          <span className="text-xl font-bold tracking-tight text-[#0B1F3A]">
            YOCar
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (link.href === "/dashboard" &&
                pathname.startsWith("/cars"));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition sm:px-4 ${
                  active
                    ? "bg-[#0B1F3A] text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-[#0B1F3A]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="ml-1 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-[#0B1F3A] sm:ml-2 sm:px-4"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}