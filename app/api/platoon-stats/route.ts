import { getSupabaseAdmin } from "@/lib/db";
import { safeJson, jsonError } from "@/lib/route-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await getSupabaseAdmin()
    .from("platoon_stats")
    .select(
      "platoon, drills_percent, pt_percent, ifc_percent, roadmap_percent, volunteer_count"
    )
    .order("platoon", { ascending: true });
  if (error) return jsonError("Failed to load platoon stats.", 500);
  return safeJson({ stats: data ?? [] });
}
