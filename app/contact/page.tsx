"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import LoadingBlock from "@/components/LoadingBlock";
import ErrorBanner from "@/components/ErrorBanner";
import EmptyState from "@/components/EmptyState";
import { fetchJson } from "@/lib/api";

interface ContactData {
  teachers: { name: string; email: string }[];
  exco: { role: string; name: string; phone: string }[];
}

function isContactData(value: unknown): value is ContactData {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<ContactData>;
  return Array.isArray(v.teachers) && Array.isArray(v.exco);
}

export default function ContactPage() {
  const [data, setData] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchJson<{ data: unknown }>("/api/contact", { cache: "no-store" })
      .then((payload) => {
        if (!mounted) return;
        setData(isContactData(payload.data) ? payload.data : null);
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

  return (
    <>
      <SiteHeader />
      <PageShell title="Contact" subtitle="Teachers-in-charge and EXCO contacts.">
        {loading ? <LoadingBlock label="Loading contact" /> : null}
        {error ? <ErrorBanner error={error} /> : null}
        {!loading && !error && data ? (
          <div className="grid gap-4">
            <div className="rounded-xl border border-olive/30 bg-olive/5 p-6">
              <p className="text-sm font-semibold text-olive-light">Teachers-in-Charge</p>
              <div className="mt-4 space-y-2">
                {data.teachers.length === 0 ? (
                  <EmptyState title="No teachers listed." />
                ) : (
                  data.teachers.map((teacher) => (
                    <div key={teacher.email} className="text-sm text-muted">
                      <p className="font-semibold text-sand">{teacher.name}</p>
                      <p>{teacher.email}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="rounded-xl border border-olive/30 bg-olive/5 p-6">
              <p className="text-sm font-semibold text-olive-light">EXCO</p>
              <div className="mt-4 space-y-2">
                {data.exco.length === 0 ? (
                  <EmptyState title="No EXCO listed." />
                ) : (
                  data.exco.map((member) => (
                    <div key={member.role} className="text-sm text-muted">
                      <p className="font-semibold text-sand">
                        {member.role} · {member.name}
                      </p>
                      <p>{member.phone}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : null}
        {!loading && !error && !data ? (
          <EmptyState title="Contact information unavailable." />
        ) : null}
      </PageShell>
    </>
  );
}
