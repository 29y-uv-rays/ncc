"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/points", label: "Points" },
  { href: "/admin/cadets", label: "Cadets" },
  { href: "/admin/rewards", label: "Rewards" },
  { href: "/admin/notes", label: "Notes" },
  { href: "/admin/contact", label: "Contact" },
  { href: "/admin/platoon-stats", label: "Platoon stats" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authState, setAuthState] = useState<"loading" | "ok" | "denied">("loading");

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    fetch("/api/admin/session", {
      signal: controller.signal,
      cache: "no-store",
      credentials: "same-origin",
    })
      .then((res) => {
        if (!mounted) return;
        setAuthState(res.ok ? "ok" : "denied");
      })
      .catch(() => {
        if (!mounted) return;
        setAuthState("denied");
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (authState === "denied") {
      router.replace("/admin");
    }
  }, [authState, router]);

  if (authState !== "ok") {
    return (
      <div className="min-h-screen bg-matte">
        <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted">
          {authState === "loading" ? "Loading..." : "Redirecting..."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-matte">
      <header className="border-b border-olive/40 bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-medium text-muted">Admin</p>
            <h1 className="text-base font-semibold text-olive-light">RINCC Control</h1>
          </div>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              await fetch("/api/admin/logout", {
                method: "POST",
                credentials: "same-origin",
              });
              router.replace("/admin");
            }}
          >
            <button
              type="submit"
              className="rounded-full border border-olive/30 bg-olive/5 px-3 py-1 text-xs font-medium text-olive-light hover:bg-olive/10"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 md:grid-cols-[200px_1fr]">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg border px-3 py-2 text-sm ${
                  active
                    ? "border-olive bg-olive/10 text-olive-light"
                    : "border-olive/20 text-muted hover:border-olive/40 hover:text-olive-light"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}
