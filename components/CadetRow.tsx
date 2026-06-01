import Link from "next/link";

interface CadetRowProps {
  rank: number;
  name: string;
  platoon: string;
  points: number;
  cadetId: number;
}

export default function CadetRow({ rank, name, platoon, points, cadetId }: CadetRowProps) {
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

  return (
    <div className="flex items-center justify-between border-b border-olive/20 py-3">
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-muted">{rank}</span>
        <div>
          <Link
            href={`/points/${platoon}/${cadetId}`}
            className="text-sm font-semibold text-sand hover:text-olive-light"
          >
            {name}
          </Link>
          <p className="text-xs font-medium text-muted">{platoon}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {medal ? <span className="text-lg">{medal}</span> : null}
        <span className="text-sm font-semibold text-olive-light">{points}</span>
      </div>
    </div>
  );
}
