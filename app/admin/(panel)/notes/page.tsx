"use client";

import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/api";

export default function AdminNotesPage() {
  const [value, setValue] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchJson<{ data: unknown }>("/api/admin/notes")
      .then((payload) => setValue(JSON.stringify(payload.data ?? {}, null, 2)))
      .catch(() => setValue("{}"));
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Edit notes JSON</h2>
        <form
          className="mt-4 grid gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setMessage(null);
            try {
              const parsed = JSON.parse(value);
              const response = await fetch("/api/admin/notes", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(parsed),
              });

              if (!response.ok) {
                const payload = await response.json();
                throw new Error(payload.error ?? "Update failed");
              }

              setMessage("Notes updated.");
            } catch (err) {
              setMessage(err instanceof Error ? err.message : "Update failed");
            }
          }}
        >
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            rows={16}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono"
          />
          {message ? <p className="text-sm text-gray-600">{message}</p> : null}
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Save notes
          </button>
        </form>
      </div>
    </div>
  );
}
