import type { ReactNode } from "react";

interface PageShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function PageShell({ title, subtitle, children }: PageShellProps) {
  return (
    <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-olive-light">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm font-normal text-muted">{subtitle}</p>
          ) : null}
        </div>
        <div className="mt-6 space-y-6">{children}</div>
      </div>
    </main>
  );
}
