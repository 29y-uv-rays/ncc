import { getSupabaseAdmin } from "@/lib/db";
import { safeJson, jsonError } from "@/lib/route-utils";
import type { Reward } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await getSupabaseAdmin()
    .from("rewards")
    .select("id, name, points_required, active, sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("points_required", { ascending: true });
  if (error) return jsonError("Failed to load rewards.", 500);
  const rewards: Reward[] = ((data ?? []) as Array<Record<string, unknown>>).map((r) => ({
    id: r.id as number,
    name: r.name as string,
    points_required: r.points_required as number,
    active: r.active as boolean,
    sort_order: r.sort_order as number,
  }));
  return safeJson({ rewards });
}
