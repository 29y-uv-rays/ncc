"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import CircularRing from "@/components/CircularRing";
import LoadingBlock from "@/components/LoadingBlock";
import ErrorBanner from "@/components/ErrorBanner";
import EmptyState from "@/components/EmptyState";
import { fetchJson } from "@/lib/api";
import { formatPlatoonLabel } from "@/lib/format";

interface PlatoonStat {
  platoon: string;
  drills_percent: number;
  pt_percent: number;
  ifc_percent: number;
  roadmap_percent: number;
  volunteer_count: number;
}

export default function RoadmapPage() {
  const [stats, setStats] = useState<PlatoonStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchJson<{ stats: PlatoonStat[] }>("/api/platoon-stats", { cache: "no-store" })
      .then((payload) => {
        if (!mounted) return;
        setStats(Array.isArray(payload.stats) ? payload.stats : []);
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
    <>
      <SiteHeader />
      <PageShell title="Roadmap" subtitle="Platoon-level readiness only.">
        {loading ? <LoadingBlock label="Loading roadmap" /> : null}
        {error ? <ErrorBanner error={error} /> : null}
        {!loading && !error && stats.length === 0 ? (
          <EmptyState
            title="No roadmap data yet."
            description="Admins can update platoon stats from the control panel."
          />
        ) : null}
        {!loading && !error && stats.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {stats.map((stat) => (
              <div
                key={stat.platoon}
                className="rounded-xl border border-olive/30 bg-olive/5 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted">Platoon</p>
                    <h3 className="text-lg font-semibold text-olive-light">
                      {formatPlatoonLabel(stat.platoon)}
                    </h3>
                  </div>
                  <span className="rounded-full border border-olive/40 bg-olive/15 px-3 py-1 text-xs text-olive-light">
                    {stat.volunteer_count} volunteers
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <CircularRing value={Number(stat.roadmap_percent)} label="Roadmap" />
                  <CircularRing value={Number(stat.drills_percent)} label="Drills" />
                  <CircularRing value={Number(stat.pt_percent)} label="PT" />
                  <CircularRing value={Number(stat.ifc_percent)} label="IFC" />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </PageShell>
    </>
  );
}
