import type { ReactNode } from "react";

interface PillProps {
  children: ReactNode;
  className?: string;
}

export function OutlinePill({ children, className = "" }: PillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 ${className}`}
    >
      {children}
    </span>
  );
}

export function SoftActionPill({ children, className = "" }: PillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 ${className}`}
    >
      {children}
    </span>
  );
}

interface StatusPillProps extends PillProps {
  dotColorClass: string;
}

export function StatusPill({ children, dotColorClass, className = "" }: StatusPillProps) {
  return (
    <OutlinePill className={className}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColorClass}`} />
      {children}
    </OutlinePill>
  );
}
