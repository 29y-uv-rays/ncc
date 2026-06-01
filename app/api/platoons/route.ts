import { getSupabaseAdmin } from "@/lib/db";
import { safeJson, jsonError } from "@/lib/route-utils";
import type { PlatoonTotals } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await getSupabaseAdmin()
    .from("cadets")
    .select("platoon, total_points");
  if (error) return jsonError("Failed to load platoons.", 500);

  const rows = (data ?? []) as Array<{
    platoon: PlatoonTotals["platoon"];
    total_points: number;
  }>;
  const grouped = new Map<
    PlatoonTotals["platoon"],
    { total_points: number; cadet_count: number }
  >();
  for (const row of rows) {
    const entry =
      grouped.get(row.platoon) ?? { total_points: 0, cadet_count: 0 };
    entry.total_points += Number(row.total_points ?? 0);
    entry.cadet_count += 1;
    grouped.set(row.platoon, entry);
  }
  const platoons: PlatoonTotals[] = Array.from(grouped.entries())
    .map(([platoon, agg]) => ({
      platoon,
      total_points: agg.total_points,
      cadet_count: agg.cadet_count,
    }))
    .sort((a, b) => a.platoon.localeCompare(b.platoon));
  return safeJson({ platoons });
}
