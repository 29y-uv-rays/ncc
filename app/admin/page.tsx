"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchJson, FetchError } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchJson<{ ok: boolean }>("/api/admin/session", { cache: "no-store" })
      .then(() => {
        if (!mounted) return;
        router.replace("/admin/dashboard");
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-xs font-medium text-gray-500">Admin</p>
          <h1 className="text-2xl font-semibold text-gray-900 mt-1">Sign in</h1>
          <p className="text-sm font-normal text-gray-600 mt-2">
            Access is limited to EXCO administrators.
          </p>
          <form
            className="mt-6 space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setLoading(true);
              setError(null);
              try {
                await fetchJson("/api/admin/login", {
                  method: "POST",
                  body: JSON.stringify({ password }),
                });
                router.replace("/admin/dashboard");
              } catch (err) {
                if (err instanceof FetchError) {
                  setError(err.message);
                } else if (err instanceof Error) {
                  setError(err.message);
                } else {
                  setError("Login failed.");
                }
              } finally {
                setLoading(false);
              }
            }}
          >
            <div>
              <label className="text-xs font-medium text-gray-500" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="Admin password"
                required
                autoComplete="current-password"
                maxLength={256}
              />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
