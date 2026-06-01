"use client";

import { useEffect, useState } from "react";
import LoadingBlock from "@/components/LoadingBlock";
import ErrorBanner from "@/components/ErrorBanner";
import { fetchJson } from "@/lib/api";

interface DashboardStats {
  cadets: number;
  totalPoints: number;
  rewards: number;
  points_logs: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.all([
      fetchJson<{ cadets: { id: number; total_points: number }[] }>("/api/admin/cadets", {
        cache: "no-store",
      }),
      fetchJson<{ rewards: unknown[] }>("/api/admin/rewards", { cache: "no-store" }),
    ])
      .then(([cadetsRes, rewardsRes]) => {
        if (!mounted) return;
        const totalPoints = (cadetsRes.cadets ?? []).reduce(
          (sum, c) => sum + Number(c.total_points ?? 0),
          0
        );
        setStats({
          cadets: (cadetsRes.cadets ?? []).length,
          totalPoints,
          rewards: (rewardsRes.rewards ?? []).length,
          points_logs: 0,
        });
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-xs font-medium text-gray-500">Overview</p>
        <h2 className="text-lg font-semibold text-gray-900 mt-1">Admin dashboard</h2>
        <p className="text-sm font-normal text-gray-600 mt-2">
          Use the left navigation to manage cadets, points, rewards, notes, contact data, and
          platoon stats.
        </p>
      </div>
      {loading ? <LoadingBlock label="Loading overview" /> : null}
      {error ? <ErrorBanner error={error} /> : null}
      {stats ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Cadets" value={stats.cadets} />
          <Stat label="Total points" value={stats.totalPoints} />
          <Stat label="Active rewards" value={stats.rewards} />
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
