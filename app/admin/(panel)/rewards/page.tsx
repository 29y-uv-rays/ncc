"use client";

import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/api";

interface Reward {
  id: number;
  name: string;
  points_required: number;
  active: boolean;
  sort_order: number;
}

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [name, setName] = useState("");
  const [pointsRequired, setPointsRequired] = useState(0);
  const [active, setActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const loadRewards = () => {
    fetchJson<{ rewards: Reward[] }>("/api/admin/rewards")
      .then((payload) => setRewards(payload.rewards ?? []))
      .catch(() => setRewards([]));
  };

  useEffect(() => {
    loadRewards();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Create reward</h2>
        <form
          className="mt-4 grid gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setMessage(null);
            try {
              const response = await fetch("/api/admin/rewards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name,
                  points_required: pointsRequired,
                  active,
                  sort_order: sortOrder,
                }),
              });

              if (!response.ok) {
                const payload = await response.json();
                throw new Error(payload.error ?? "Failed");
              }

              setName("");
              setPointsRequired(0);
              setActive(true);
              setSortOrder(0);
              setMessage("Reward created.");
              loadRewards();
            } catch (err) {
              setMessage(err instanceof Error ? err.message : "Failed");
            }
          }}
        >
          <div>
            <label className="text-xs font-medium text-gray-500" htmlFor="rewardName">
              Name
            </label>
            <input
              id="rewardName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500" htmlFor="pointsRequired">
              Points required
            </label>
            <input
              id="pointsRequired"
              type="number"
              value={pointsRequired}
              onChange={(event) => setPointsRequired(Number(event.target.value))}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500" htmlFor="sortOrder">
              Sort order
            </label>
            <input
              id="sortOrder"
              type="number"
              value={sortOrder}
              onChange={(event) => setSortOrder(Number(event.target.value))}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500" htmlFor="active">
              Status
            </label>
            <select
              id="active"
              value={active ? "active" : "hidden"}
              onChange={(event) => setActive(event.target.value === "active")}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="active">Active</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
          {message ? <p className="text-sm text-gray-600">{message}</p> : null}
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Create reward
          </button>
        </form>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Existing rewards</h2>
        <div className="mt-4 space-y-3">
          {rewards.map((reward) => (
            <div key={reward.id} className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{reward.name}</p>
                  <p className="text-xs font-medium text-gray-500">
                    {reward.points_required} pts · Order {reward.sort_order}
                  </p>
                </div>
                <span className="text-xs font-medium text-gray-500">
                  {reward.active ? "Active" : "Hidden"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
