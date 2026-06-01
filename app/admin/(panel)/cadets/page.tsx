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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const loadCadets = () => {
    fetchJson<{ cadets: Cadet[] }>("/api/admin/cadets")
      .then((payload) => setCadets(payload.cadets ?? []))
      .catch(() => setCadets([]));
  };

  useEffect(() => {
    loadCadets();
  }, []);

  const handleUpdate = async (id: number) => {
    setMessage(null);
    try {
      const response = await fetch("/api/admin/cadets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: editingName }),
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Failed");
      }
      setEditingId(null);
      setMessage("Cadet updated.");
      loadCadets();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this cadet? This cannot be undone.")) return;
    setMessage(null);
    try {
      const response = await fetch("/api/admin/cadets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Failed");
      }
      setMessage("Cadet removed.");
      loadCadets();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-olive/30 bg-olive/5 p-6">
        <h2 className="text-lg font-semibold text-olive-light">Add cadet</h2>
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
              className="mt-1 w-full rounded-lg border border-olive/30 bg-matte px-3 py-2 text-sm text-sand"
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
              className="mt-1 w-full rounded-lg border border-olive/30 bg-matte px-3 py-2 text-sm text-sand"
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
      <div className="rounded-xl border border-olive/30 bg-olive/5 p-6">
        <h2 className="text-lg font-semibold text-olive-light">All cadets</h2>
        <div className="mt-4 space-y-2">
          {cadets.map((cadet) => (
            <div
              key={cadet.id}
              className="flex items-center justify-between gap-3 border-b border-olive/30 py-2"
            >
              <div className="min-w-0 flex-1">
                {editingId === cadet.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      className="w-full rounded-lg border border-olive/30 bg-matte px-3 py-1 text-sm text-sand"
                      autoFocus
                      onKeyDown={(event) => {
                        if (event.key === "Enter") handleUpdate(cadet.id);
                        if (event.key === "Escape") setEditingId(null);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdate(cadet.id)}
                      className="shrink-0 rounded-lg bg-olive px-3 py-1 text-xs font-semibold text-matte"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="shrink-0 rounded-lg border border-olive/30 px-3 py-1 text-xs font-medium text-muted hover:text-sand"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-sand truncate">{cadet.name}</p>
                      <p className="text-xs font-medium text-muted">{cadet.platoon}</p>
                    </div>
                    <span className="text-sm font-semibold text-olive-light shrink-0">
                      {cadet.total_points}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(cadet.id);
                          setEditingName(cadet.name);
                        }}
                        className="rounded border border-olive/30 px-2 py-0.5 text-xs text-muted hover:text-olive-light hover:border-olive/60"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cadet.id)}
                        className="rounded border border-red-800/30 px-2 py-0.5 text-xs text-red-400 hover:bg-red-900/20"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
