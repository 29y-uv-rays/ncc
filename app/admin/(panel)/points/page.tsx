"use client";

import { useEffect, useState } from "react";
import { fetchJson, FetchError } from "@/lib/api";

interface Cadet {
  id: number;
  name: string;
  platoon: string;
}

const categories = ["drills", "pt", "ifc", "misc"];

export default function AdminPointsPage() {
  const [platoon, setPlatoon] = useState("P1");
  const [cadets, setCadets] = useState<Cadet[]>([]);
  const [cadetId, setCadetId] = useState<number | "">("");
  const [category, setCategory] = useState("drills");
  const [points, setPoints] = useState(0);
  const [reason, setReason] = useState("");
  const [awardedBy, setAwardedBy] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCadetId("");
    fetchJson<{ cadets: Cadet[] }>(`/api/admin/cadets?platoon=${platoon}`, {
      cache: "no-store",
    })
      .then((payload) => {
        if (!mounted) return;
        setCadets(Array.isArray(payload.cadets) ? payload.cadets : []);
      })
      .catch(() => {
        if (!mounted) return;
        setCadets([]);
      });
    return () => {
      mounted = false;
    };
  }, [platoon]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-olive/30 bg-olive/5 p-6">
        <h2 className="text-lg font-semibold text-olive-light">Add or deduct points</h2>
        <form
          className="mt-4 grid gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            setMessage(null);
            try {
              await fetchJson("/api/admin/points", {
                method: "POST",
                body: JSON.stringify({
                  cadet_id: cadetId,
                  category,
                  points,
                  reason,
                  awarded_by: awardedBy,
                }),
              });
              setMessage({ kind: "ok", text: "Points updated." });
              setReason("");
              setAwardedBy("");
              setPoints(0);
            } catch (err) {
              setMessage({
                kind: "err",
                text:
                  err instanceof FetchError
                    ? err.message
                    : err instanceof Error
                    ? err.message
                    : "Update failed.",
              });
            } finally {
              setLoading(false);
            }
          }}
        >
          <div>
            <label className="text-xs font-medium text-muted" htmlFor="platoon">
              Platoon
            </label>
            <select
              id="platoon"
              value={platoon}
              onChange={(event) => setPlatoon(event.target.value)}
              className="mt-1 w-full rounded-lg border border-olive/30 bg-matte px-3 py-2 text-sm text-sand"
            >
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
              <option value="SPEC">SPEC</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted" htmlFor="cadet">
              Cadet
            </label>
            <select
              id="cadet"
              value={cadetId}
              onChange={(event) =>
                setCadetId(event.target.value ? Number(event.target.value) : "")
              }
              className="mt-1 w-full rounded-lg border border-olive/30 bg-matte px-3 py-2 text-sm text-sand"
              required
            >
              <option value="">{cadets.length === 0 ? "No cadets in platoon" : "Select cadet"}</option>
              {cadets.map((cadet) => (
                <option key={cadet.id} value={cadet.id}>
                  {cadet.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-1 w-full rounded-lg border border-olive/30 bg-matte px-3 py-2 text-sm text-sand"
            >
              {categories.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted" htmlFor="points">
              Points (use negative for deductions)
            </label>
            <input
              id="points"
              type="number"
              value={points}
              onChange={(event) => setPoints(Number(event.target.value))}
              className="mt-1 w-full rounded-lg border border-olive/30 bg-matte px-3 py-2 text-sm text-sand"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted" htmlFor="reason">
              Reason
            </label>
            <input
              id="reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-1 w-full rounded-lg border border-olive/30 bg-matte px-3 py-2 text-sm text-sand"
              required
              maxLength={500}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted" htmlFor="awardedBy">
              Awarded by
            </label>
            <input
              id="awardedBy"
              value={awardedBy}
              onChange={(event) => setAwardedBy(event.target.value)}
              className="mt-1 w-full rounded-lg border border-olive/30 bg-matte px-3 py-2 text-sm text-sand"
              required
              maxLength={100}
            />
          </div>
          {message ? (
            <p
              className={`text-sm ${
                message.kind === "ok" ? "text-olive-light" : "text-red-400"
              }`}
            >
              {message.text}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-olive px-4 py-2 text-sm font-semibold text-matte hover:bg-olive-dark disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
