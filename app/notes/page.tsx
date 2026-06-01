"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import NotesRenderer from "@/components/NotesRenderer";
import LoadingBlock from "@/components/LoadingBlock";
import ErrorBanner from "@/components/ErrorBanner";
import EmptyState from "@/components/EmptyState";
import { fetchJson } from "@/lib/api";
import type { NotesData } from "@/lib/notes";

export default function NotesPage() {
  const [data, setData] = useState<NotesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchJson<{ data: NotesData | null }>("/api/notes", { cache: "no-store" })
      .then((payload) => {
        if (!mounted) return;
        setData(payload.data ?? null);
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

  const sections = data?.sections;
  const hasSections = Array.isArray(sections) && sections.length > 0;

  return (
    <>
      <SiteHeader />
      <PageShell
        title={data?.title ?? "Notes"}
        subtitle={data?.subtitle ?? "Specialist assessment notes and drills."}
      >
        {loading ? <LoadingBlock label="Loading notes" /> : null}
        {error ? <ErrorBanner error={error} /> : null}
        {!loading && !error && hasSections ? (
          <NotesRenderer sections={sections as NonNullable<NotesData>["sections"]} />
        ) : null}
        {!loading && !error && !hasSections ? (
          <EmptyState
            title="Notes not available yet."
            description="Check back later or contact an admin."
          />
        ) : null}
      </PageShell>
    </>
  );
}
