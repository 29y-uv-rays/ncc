"use client";

import { use, useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import CadetRow from "@/components/CadetRow";
import CircularRing from "@/components/CircularRing";
import LoadingBlock from "@/components/LoadingBlock";
import ErrorBanner from "@/components/ErrorBanner";
import EmptyState from "@/components/EmptyState";
import { fetchJson } from "@/lib/api";
import { formatPlatoonLabel } from "@/lib/format";

interface PlatoonData {
  totals: { total_points: number; cadet_count: number };
  leaderboard: { id: number; name: string; platoon: string; total_points: number }[];
  categories: Record<string, number>;
}

export default function PlatoonPage({
  params,
}: {
  params: Promise<{ platoon: string }>;
}) {
  const { platoon } = use(params);
  const normalized = platoon.toUpperCase();
  const [data, setData] = useState<PlatoonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    fetchJson<PlatoonData>(`/api/platoon/${normalized}`, { cache: "no-store" })
      .then((payload) => {
        if (!mounted) return;
        setData(payload);
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
  }, [normalized]);

  const categoryStats = useMemo(() => {
    const totals = data?.categories ?? {};
    const sum = Object.values(totals).reduce((acc, value) => acc + value, 0);
    const toPercent = (value: number) => (sum > 0 ? (value / sum) * 100 : 0);
    return [
      { label: "Drills", value: toPercent(totals.drills ?? 0) },
      { label: "PT", value: toPercent(totals.pt ?? 0) },
      { label: "IFC", value: toPercent(totals.ifc ?? 0) },
      { label: "Misc", value: toPercent(totals.misc ?? 0) },
    ];
  }, [data]);

  return (
    <>
      <SiteHeader />
      <PageShell
        title={formatPlatoonLabel(normalized)}
        subtitle="Platoon totals and leaderboard."
      >
        {loading ? <LoadingBlock label="Loading platoon" /> : null}
        {error ? <ErrorBanner error={error} /> : null}
        {!loading && !error && data ? (
          <>
            <div className="rounded-xl border border-olive/30 bg-olive/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted">Total points</p>
                  <p className="text-2xl font-semibold text-olive-light">
                    {data.totals.total_points}
                  </p>
                </div>
                <span className="rounded-full border border-olive/40 bg-olive/15 px-3 py-1 text-xs text-olive-light">
                  {data.totals.cadet_count} cadets
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-olive/30 bg-olive/5 p-6">
              <p className="text-sm font-semibold text-olive-light">Category breakdown</p>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {categoryStats.map((stat) => (
                  <CircularRing key={stat.label} value={stat.value} label={stat.label} />
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-olive/30 bg-olive/5 p-6">
              <p className="text-sm font-semibold text-olive-light">Leaderboard</p>
              <div className="mt-4">
                {data.leaderboard.length === 0 ? (
                  <EmptyState
                    title="No cadets in this platoon yet."
                    description="Add cadets from the admin panel."
                  />
                ) : (
                  data.leaderboard.map((cadet, index) => (
                    <CadetRow
                      key={cadet.id}
                      rank={index + 1}
                      name={cadet.name}
                      platoon={cadet.platoon}
                      points={cadet.total_points}
                      cadetId={cadet.id}
                    />
                  ))
                )}
              </div>
            </div>
          </>
        ) : null}
      </PageShell>
    </>
  );
}
