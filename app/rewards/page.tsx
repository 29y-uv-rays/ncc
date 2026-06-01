"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import ProgressBar from "@/components/ProgressBar";
import LoadingBlock from "@/components/LoadingBlock";
import ErrorBanner from "@/components/ErrorBanner";
import EmptyState from "@/components/EmptyState";
import { fetchJson } from "@/lib/api";
import type { Cadet, Reward } from "@/lib/types";

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [cadets, setCadets] = useState<Cadet[]>([]);
  const [selectedCadetId, setSelectedCadetId] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.all([
      fetchJson<{ rewards: Reward[] }>("/api/rewards", { cache: "no-store" }),
      fetchJson<{ cadets: Cadet[] }>("/api/leaderboard", { cache: "no-store" }),
    ])
      .then(([rewardData, cadetData]) => {
        if (!mounted) return;
        setRewards(Array.isArray(rewardData.rewards) ? rewardData.rewards : []);
        setCadets(Array.isArray(cadetData.cadets) ? cadetData.cadets : []);
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

  const selectedCadet = useMemo(() => {
    if (typeof selectedCadetId !== "number") return null;
    return cadets.find((c) => c.id === selectedCadetId) ?? null;
  }, [cadets, selectedCadetId]);

  return (
    <>
      <SiteHeader />
      <PageShell title="Rewards" subtitle="Track progress toward rewards.">
        <div className="rounded-xl border border-olive/30 bg-olive/5 p-6 space-y-4">
          <p className="text-sm font-normal text-muted">
            Rewards are handled manually by EXCO.
          </p>
          <div>
            <label className="text-xs font-medium text-muted" htmlFor="cadet">
              Select cadet
            </label>
            <select
              id="cadet"
              value={selectedCadetId}
              onChange={(event) =>
                setSelectedCadetId(event.target.value ? Number(event.target.value) : "")
              }
              className="mt-1 w-full rounded-lg border border-olive/30 bg-matte px-3 py-2 text-sm text-sand"
            >
              <option value="">Choose a cadet</option>
              {cadets.map((cadet) => (
                <option key={cadet.id} value={cadet.id}>
                  {cadet.name} ({cadet.platoon})
                </option>
              ))}
            </select>
          </div>
        </div>
        {loading ? <LoadingBlock label="Loading rewards" /> : null}
        {error ? <ErrorBanner error={error} /> : null}
        {!loading && !error ? (
          <div className="grid gap-4">
            {rewards.length === 0 ? (
              <EmptyState
                title="No rewards yet."
                description="Add rewards from the admin panel."
              />
            ) : (
              rewards.map((reward) => (
                <div key={reward.id} className="rounded-xl border border-olive/30 bg-olive/5 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted">Reward</p>
                      <h3 className="text-base font-semibold text-olive-light">
                        {reward.name}
                      </h3>
                    </div>
                    <span className="rounded-full border border-olive/40 bg-olive/15 px-3 py-1 text-xs text-olive-light">
                      {reward.points_required} pts
                    </span>
                  </div>
                  <div className="mt-4">
                    <ProgressBar
                      value={selectedCadet?.total_points ?? 0}
                      max={reward.points_required}
                    />
                    {selectedCadet ? (
                      <p className="text-xs font-medium text-muted mt-2">
                        {Math.min(selectedCadet.total_points, reward.points_required)} / {reward.points_required} points
                      </p>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}
      </PageShell>
    </>
  );
}
