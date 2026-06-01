interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = "No data yet.",
  description,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dark-border bg-surface p-6 text-center">
      <p className="text-sm font-semibold text-sand">{title}</p>
      {description ? (
        <p className="text-sm font-normal text-muted mt-1">{description}</p>
      ) : null}
    </div>
  );
}
