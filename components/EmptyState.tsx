interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = "No data yet.",
  description,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      {description ? (
        <p className="text-sm font-normal text-gray-600 mt-1">{description}</p>
      ) : null}
    </div>
  );
}
