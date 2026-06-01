export default function LoadingBlock({ label = "Loading" }: { label?: string }) {
  return (
    <div className="rounded-xl border border-olive/20 bg-olive/5 p-6 text-sm text-muted">
      {label}...
    </div>
  );
}
