import { getSupabaseAdmin } from "@/lib/db";
import { safeJson, jsonError } from "@/lib/route-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await getSupabaseAdmin()
    .from("content")
    .select("data")
    .eq("type", "contact")
    .maybeSingle();
  if (error) return jsonError("Failed to load contact data.", 500);
  return safeJson({ data: data?.data ?? null });
}
