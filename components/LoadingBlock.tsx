export default function LoadingBlock({ label = "Loading" }: { label?: string }) {
  return (
    <div className="rounded-xl border border-dark-border bg-surface p-6 text-sm text-muted">
      {label}...
    </div>
  );
}
