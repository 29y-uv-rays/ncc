"use client";

import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/api";

interface PlatoonStat {
  platoon: string;
  drills_percent: number;
  pt_percent: number;
  ifc_percent: number;
  roadmap_percent: number;
  volunteer_count: number;
}

export default function AdminPlatoonStatsPage() {
  const [stats, setStats] = useState<PlatoonStat[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const loadStats = () => {
    fetchJson<{ stats: PlatoonStat[] }>("/api/admin/platoon-stats")
      .then((payload) => setStats(payload.stats ?? []))
      .catch(() => setStats([]));
  };

  useEffect(() => {
    loadStats();
  }, []);

  const updateStat = async (stat: PlatoonStat) => {
    setMessage(null);
    try {
      const response = await fetch("/api/admin/platoon-stats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stat),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Update failed");
      }

      setMessage(`Updated ${stat.platoon}.`);
      loadStats();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Update failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Platoon stats</h2>
        <p className="text-sm font-normal text-gray-600 mt-2">
          Update the platoon roadmap and readiness percentages.
        </p>
        {message ? <p className="text-sm text-gray-600 mt-3">{message}</p> : null}
        <div className="mt-4 space-y-4">
          {stats.map((stat, index) => (
            <div key={stat.platoon} className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-900">{stat.platoon}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  value={stat.roadmap_percent}
                  onChange={(event) => {
                    const next = [...stats];
                    next[index] = {
                      ...stat,
                      roadmap_percent: Number(event.target.value),
                    };
                    setStats(next);
                  }}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Roadmap %"
                />
                <input
                  type="number"
                  value={stat.drills_percent}
                  onChange={(event) => {
                    const next = [...stats];
                    next[index] = {
                      ...stat,
                      drills_percent: Number(event.target.value),
                    };
                    setStats(next);
                  }}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Drills %"
                />
                <input
                  type="number"
                  value={stat.pt_percent}
                  onChange={(event) => {
                    const next = [...stats];
                    next[index] = {
                      ...stat,
                      pt_percent: Number(event.target.value),
                    };
                    setStats(next);
                  }}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="PT %"
                />
                <input
                  type="number"
                  value={stat.ifc_percent}
                  onChange={(event) => {
                    const next = [...stats];
                    next[index] = {
                      ...stat,
                      ifc_percent: Number(event.target.value),
                    };
                    setStats(next);
                  }}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="IFC %"
                />
                <input
                  type="number"
                  value={stat.volunteer_count}
                  onChange={(event) => {
                    const next = [...stats];
                    next[index] = {
                      ...stat,
                      volunteer_count: Number(event.target.value),
                    };
                    setStats(next);
                  }}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Volunteers"
                />
              </div>
              <button
                type="button"
                onClick={() => updateStat(stat)}
                className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Save
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
