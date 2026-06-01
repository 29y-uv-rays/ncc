import { FetchError } from "@/lib/api";

interface ErrorBannerProps {
  error: unknown;
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (error instanceof FetchError) return error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return fallback;
}

export default function ErrorBanner({ error }: ErrorBannerProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6">
      <p className="text-xs font-medium text-red-700">Error</p>
      <p className="text-sm font-normal text-red-700 mt-1">
        {getErrorMessage(error)}
      </p>
    </div>
  );
}
