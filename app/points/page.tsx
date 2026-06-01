"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import PlatoonCard from "@/components/PlatoonCard";
import CadetRow from "@/components/CadetRow";
import LoadingBlock from "@/components/LoadingBlock";
import ErrorBanner from "@/components/ErrorBanner";
import EmptyState from "@/components/EmptyState";
import { fetchJson } from "@/lib/api";
import { formatPlatoonLabel } from "@/lib/format";
import type { Cadet, PlatoonTotals } from "@/lib/types";

type Tab = "leaderboard" | "platoons";

export default function PointsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("leaderboard");
  const [leaderboard, setLeaderboard] = useState<Cadet[]>([]);
  const [platoons, setPlatoons] = useState<PlatoonTotals[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.all([
      fetchJson<{ cadets: Cadet[] }>("/api/leaderboard", { cache: "no-store" }),
      fetchJson<{ platoons: PlatoonTotals[] }>("/api/platoons", { cache: "no-store" }),
    ])
      .then(([lb, pl]) => {
        if (!mounted) return;
        setLeaderboard(Array.isArray(lb.cadets) ? lb.cadets : []);
        setPlatoons(Array.isArray(pl.platoons) ? pl.platoons : []);
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

  const sortedPlatoons = useMemo(
    () => [...platoons].sort((a, b) => a.platoon.localeCompare(b.platoon)),
    [platoons]
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: "leaderboard", label: "Global leaderboard" },
    { id: "platoons", label: "Platoons" },
  ];

  return (
    <>
      <SiteHeader />
      <PageShell title="Points" subtitle="Leaderboard and platoon overview.">
        <div className="rounded-xl border border-olive/30 bg-olive/5">
          <div className="border-b border-olive/30 px-6">
            <div className="flex gap-6">
              {tabs.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-sm ${
                      active
                        ? "text-olive-light font-medium border-b-2 border-olive -mb-[1px]"
                        : "text-muted font-normal border-b-2 border-transparent hover:text-olive-light"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="p-6">
            {loading ? <LoadingBlock label="Loading points" /> : null}
            {error ? <ErrorBanner error={error} /> : null}
            {!loading && !error && activeTab === "leaderboard" ? (
              <div>
                {leaderboard.length === 0 ? (
                  <EmptyState
                    title="No cadets yet."
                    description="Add cadets from the admin panel."
                  />
                ) : (
                  <div>
                    {leaderboard.map((cadet, index) => (
                      <CadetRow
                        key={cadet.id}
                        rank={index + 1}
                        name={cadet.name}
                        platoon={cadet.platoon}
                        points={cadet.total_points}
                        cadetId={cadet.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : null}
            {!loading && !error && activeTab === "platoons" ? (
              sortedPlatoons.length === 0 ? (
                <EmptyState
                  title="No platoons available."
                  description="Add cadets to get started."
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {sortedPlatoons.map((platoon) => (
                    <PlatoonCard
                      key={platoon.platoon}
                      platoonCode={platoon.platoon}
                      label={formatPlatoonLabel(platoon.platoon)}
                      points={platoon.total_points}
                      cadetCount={platoon.cadet_count}
                    />
                  ))}
                </div>
              )
            ) : null}
          </div>
        </div>
      </PageShell>
    </>
  );
}
