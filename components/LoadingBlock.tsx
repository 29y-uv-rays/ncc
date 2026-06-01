export default function LoadingBlock({ label = "Loading" }: { label?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
      {label}...
    </div>
  );
}
