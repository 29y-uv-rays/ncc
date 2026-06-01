"use client";

import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/api";

interface Cadet {
  id: number;
  name: string;
  platoon: string;
  total_points: number;
}

export default function AdminCadetsPage() {
  const [cadets, setCadets] = useState<Cadet[]>([]);
  const [name, setName] = useState("");
  const [platoon, setPlatoon] = useState("P1");
  const [message, setMessage] = useState<string | null>(null);

  const loadCadets = () => {
    fetchJson<{ cadets: Cadet[] }>("/api/admin/cadets")
      .then((payload) => setCadets(payload.cadets ?? []))
      .catch(() => setCadets([]));
  };

  useEffect(() => {
    loadCadets();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-dark-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-sand">Add cadet</h2>
        <form
          className="mt-4 grid gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setMessage(null);
            try {
              const response = await fetch("/api/admin/cadets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, platoon }),
              });

              if (!response.ok) {
                const payload = await response.json();
                throw new Error(payload.error ?? "Failed");
              }

              setName("");
              setMessage("Cadet added.");
              loadCadets();
            } catch (err) {
              setMessage(err instanceof Error ? err.message : "Failed");
            }
          }}
        >
          <div>
            <label className="text-xs font-medium text-muted" htmlFor="cadetName">
              Name
            </label>
            <input
              id="cadetName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-dark-border bg-matte px-3 py-2 text-sm text-sand"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted" htmlFor="cadetPlatoon">
              Platoon
            </label>
            <select
              id="cadetPlatoon"
              value={platoon}
              onChange={(event) => setPlatoon(event.target.value)}
              className="mt-1 w-full rounded-lg border border-dark-border bg-matte px-3 py-2 text-sm text-sand"
            >
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
              <option value="SPEC">SPEC</option>
            </select>
          </div>
          {message ? <p className="text-sm text-muted">{message}</p> : null}
          <button
            type="submit"
            className="rounded-lg bg-olive px-4 py-2 text-sm font-semibold text-matte"
          >
            Add cadet
          </button>
        </form>
      </div>
      <div className="rounded-xl border border-dark-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-sand">All cadets</h2>
        <div className="mt-4 space-y-2">
          {cadets.map((cadet) => (
            <div key={cadet.id} className="flex items-center justify-between border-b border-dark-border py-2">
              <div>
                <p className="text-sm font-semibold text-sand">{cadet.name}</p>
                <p className="text-xs font-medium text-muted">{cadet.platoon}</p>
              </div>
              <span className="text-sm font-semibold text-sand">
                {cadet.total_points}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
