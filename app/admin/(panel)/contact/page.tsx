"use client";

import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/api";

export default function AdminContactPage() {
  const [value, setValue] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchJson<{ data: unknown }>("/api/admin/contact")
      .then((payload) => setValue(JSON.stringify(payload.data ?? {}, null, 2)))
      .catch(() => setValue("{}"));
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-olive/30 bg-olive/5 p-6">
        <h2 className="text-lg font-semibold text-olive-light">Edit contact JSON</h2>
        <form
          className="mt-4 grid gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setMessage(null);
            try {
              const parsed = JSON.parse(value);
              const response = await fetch("/api/admin/contact", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(parsed),
              });

              if (!response.ok) {
                const payload = await response.json();
                throw new Error(payload.error ?? "Update failed");
              }

              setMessage("Contact updated.");
            } catch (err) {
              setMessage(err instanceof Error ? err.message : "Update failed");
            }
          }}
        >
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            rows={14}
            className="w-full rounded-lg border border-olive/30 bg-matte px-3 py-2 text-sm font-mono text-sand"
          />
          {message ? <p className="text-sm text-muted">{message}</p> : null}
          <button
            type="submit"
            className="rounded-lg bg-olive px-4 py-2 text-sm font-semibold text-matte"
          >
            Save contact
          </button>
        </form>
      </div>
    </div>
  );
}
