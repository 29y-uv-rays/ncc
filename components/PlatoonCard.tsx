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
      className="rounded-xl border border-gray-200 bg-white p-6 transition-colors hover:border-gray-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">Platoon</p>
          <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
        </div>
        <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700">
          {cadetCount} cadets
        </span>
      </div>
      <div className="mt-4">
        <p className="text-xs font-medium text-gray-500">Total points</p>
        <p className="text-2xl font-semibold text-gray-900">{points}</p>
      </div>
    </Link>
  );
}
