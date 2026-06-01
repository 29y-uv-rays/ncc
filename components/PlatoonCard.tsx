import Link from "next/link";

interface PlatoonCardProps {
  platoonCode: string;
  label: string;
  points: number;
  cadetCount: number;
}

export default function PlatoonCard({
  platoonCode,
  label,
  points,
  cadetCount,
}: PlatoonCardProps) {
  return (
    <Link
      href={`/points/${platoonCode}`}
      className="rounded-xl border border-dark-border bg-surface p-6 transition-colors hover:border-hover-border"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted">Platoon</p>
          <h3 className="text-lg font-semibold text-sand">{label}</h3>
        </div>
        <span className="rounded-full border border-dark-border bg-surface px-3 py-1 text-xs text-coyote-light">
          {cadetCount} cadets
        </span>
      </div>
      <div className="mt-4">
        <p className="text-xs font-medium text-muted">Total points</p>
        <p className="text-2xl font-semibold text-sand">{points}</p>
      </div>
    </Link>
  );
}
