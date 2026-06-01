interface ProgressBarProps {
  value: number;
  max: number;
}

export default function ProgressBar({ value, max }: ProgressBarProps) {
  const ratio = max > 0 ? Math.min(value / max, 1) : 0;
  const percent = Math.round(ratio * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-medium text-muted">
        <span>Progress</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-olive-dim/50">
        <div
          className="h-2 rounded-full bg-olive"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
