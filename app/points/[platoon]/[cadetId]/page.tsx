"use client";

import { use, useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import LoadingBlock from "@/components/LoadingBlock";
import ErrorBanner from "@/components/ErrorBanner";
import EmptyState from "@/components/EmptyState";
import { fetchJson } from "@/lib/api";
import { formatPlatoonLabel } from "@/lib/format";

interface CadetData {
  cadet: { id: number; name: string; platoon: string; total_points: number };
  breakdown: Record<string, number>;
  history: {
    points: number;
    category: string;
    reason: string;
    awarded_by: string;
    created_at: string;
  }[];
}

export default function CadetPage({
  params,
}: {
  params: Promise<{ cadetId: string }>;
}) {
  const { cadetId } = use(params);
  const [data, setData] = useState<CadetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    fetchJson<CadetData>(`/api/cadet/${cadetId}`, { cache: "no-store" })
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
  }, [cadetId]);

  const categoryRows = useMemo(() => {
    if (!data) return [];
    return [
      { label: "Drills", value: data.breakdown.drills ?? 0 },
      { label: "PT", value: data.breakdown.pt ?? 0 },
      { label: "IFC", value: data.breakdown.ifc ?? 0 },
      { label: "Misc", value: data.breakdown.misc ?? 0 },
    ];
  }, [data]);

  return (
    <>
      <SiteHeader />
      <PageShell title="Cadet Profile" subtitle="Individual points and history.">
        {loading ? <LoadingBlock label="Loading cadet" /> : null}
        {error ? <ErrorBanner error={error} /> : null}
        {!loading && !error && data ? (
          <>
            <div className="rounded-xl border border-olive/30 bg-olive/5 p-6">
              <p className="text-xs font-medium text-muted">Cadet</p>
              <h2 className="text-xl font-semibold text-olive-light mt-1">{data.cadet.name}</h2>
              <p className="text-sm font-normal text-muted mt-2">
                {formatPlatoonLabel(data.cadet.platoon)} · Total points {data.cadet.total_points}
              </p>
            </div>
            <div className="rounded-xl border border-olive/30 bg-olive/5 p-6">
              <p className="text-sm font-semibold text-olive-light">Category breakdown</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {categoryRows.map((row) => (
                  <div key={row.label} className="rounded-lg border border-olive/30 bg-olive/5 p-3">
                    <p className="text-xs font-medium text-muted">{row.label}</p>
                    <p className="text-lg font-semibold text-olive-light">{row.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-olive/30 bg-olive/5 p-6">
              <p className="text-sm font-semibold text-olive-light">Points history</p>
              <div className="mt-4 space-y-3">
                {data.history.length === 0 ? (
                  <EmptyState
                    title="No points history yet."
                    description="Activity will appear here once points are awarded."
                  />
                ) : (
                  data.history.map((entry, index) => (
                    <div
                      key={`${entry.created_at}-${index}`}
                      className="border-b border-olive/20 pb-3 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-semibold ${
                            entry.points >= 0 ? "text-olive-light" : "text-red-400"
                          }`}
                        >
                          {entry.points >= 0 ? "+" : ""}
                          {entry.points}
                        </span>
                        <span className="text-xs font-medium text-muted">
                          {new Date(entry.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm font-normal text-muted mt-1">{entry.reason}</p>
                      <p className="text-xs font-medium text-dim mt-1">
                        Awarded by {entry.awarded_by}
                      </p>
                    </div>
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
