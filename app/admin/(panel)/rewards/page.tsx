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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editPoints, setEditPoints] = useState(0);
  const [editSort, setEditSort] = useState(0);
  const [editActive, setEditActive] = useState(true);

  const loadRewards = () => {
    fetchJson<{ rewards: Reward[] }>("/api/admin/rewards")
      .then((payload) => setRewards(payload.rewards ?? []))
      .catch(() => setRewards([]));
  };

  useEffect(() => {
    loadRewards();
  }, []);

  const handleUpdate = async (id: number) => {
    setMessage(null);
    try {
      const response = await fetch("/api/admin/rewards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: editName,
          points_required: editPoints,
          sort_order: editSort,
          active: editActive,
        }),
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Failed");
      }
      setEditingId(null);
      setMessage("Reward updated.");
      loadRewards();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this reward? This cannot be undone.")) return;
    setMessage(null);
    try {
      const response = await fetch("/api/admin/rewards", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Failed");
      }
      setMessage("Reward removed.");
      loadRewards();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-olive/30 bg-olive/5 p-6">
        <h2 className="text-lg font-semibold text-olive-light">Create reward</h2>
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
            <label className="text-xs font-medium text-muted" htmlFor="rewardName">
              Name
            </label>
            <input
              id="rewardName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-olive/30 bg-matte px-3 py-2 text-sm text-sand"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted" htmlFor="pointsRequired">
              Points required
            </label>
            <input
              id="pointsRequired"
              type="number"
              value={pointsRequired}
              onChange={(event) => setPointsRequired(Number(event.target.value))}
              className="mt-1 w-full rounded-lg border border-olive/30 bg-matte px-3 py-2 text-sm text-sand"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted" htmlFor="sortOrder">
              Sort order
            </label>
            <input
              id="sortOrder"
              type="number"
              value={sortOrder}
              onChange={(event) => setSortOrder(Number(event.target.value))}
              className="mt-1 w-full rounded-lg border border-olive/30 bg-matte px-3 py-2 text-sm text-sand"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted" htmlFor="active">
              Status
            </label>
            <select
              id="active"
              value={active ? "active" : "hidden"}
              onChange={(event) => setActive(event.target.value === "active")}
              className="mt-1 w-full rounded-lg border border-olive/30 bg-matte px-3 py-2 text-sm text-sand"
            >
              <option value="active">Active</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
          {message ? <p className="text-sm text-muted">{message}</p> : null}
          <button
            type="submit"
            className="rounded-lg bg-olive px-4 py-2 text-sm font-semibold text-matte"
          >
            Create reward
          </button>
        </form>
      </div>
      <div className="rounded-xl border border-olive/30 bg-olive/5 p-6">
        <h2 className="text-lg font-semibold text-olive-light">Existing rewards</h2>
        <div className="mt-4 space-y-3">
          {rewards.map((reward) => (
            <div key={reward.id} className="rounded-lg border border-olive/30 p-4">
              {editingId === reward.id ? (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-muted">Name</span>
                      <input
                        value={editName}
                        onChange={(event) => setEditName(event.target.value)}
                        className="rounded-lg border border-olive/30 bg-matte px-3 py-1.5 text-sm text-sand"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-muted">Points required</span>
                      <input
                        type="number"
                        value={editPoints}
                        onChange={(event) => setEditPoints(Number(event.target.value))}
                        className="rounded-lg border border-olive/30 bg-matte px-3 py-1.5 text-sm text-sand"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-muted">Sort order</span>
                      <input
                        type="number"
                        value={editSort}
                        onChange={(event) => setEditSort(Number(event.target.value))}
                        className="rounded-lg border border-olive/30 bg-matte px-3 py-1.5 text-sm text-sand"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-muted">Status</span>
                      <select
                        value={editActive ? "active" : "hidden"}
                        onChange={(event) => setEditActive(event.target.value === "active")}
                        className="rounded-lg border border-olive/30 bg-matte px-3 py-1.5 text-sm text-sand"
                      >
                        <option value="active">Active</option>
                        <option value="hidden">Hidden</option>
                      </select>
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdate(reward.id)}
                      className="rounded-lg bg-olive px-3 py-1 text-xs font-semibold text-matte"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-olive/30 px-3 py-1 text-xs font-medium text-muted hover:text-sand"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-sand">{reward.name}</p>
                    <p className="text-xs font-medium text-muted">
                      {reward.points_required} pts · Order {reward.sort_order}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted">
                      {reward.active ? "Active" : "Hidden"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(reward.id);
                        setEditName(reward.name);
                        setEditPoints(reward.points_required);
                        setEditSort(reward.sort_order);
                        setEditActive(reward.active);
                      }}
                      className="rounded border border-olive/30 px-2 py-0.5 text-xs text-muted hover:text-olive-light hover:border-olive/60"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(reward.id)}
                      className="rounded border border-red-800/30 px-2 py-0.5 text-xs text-red-400 hover:bg-red-900/20"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
