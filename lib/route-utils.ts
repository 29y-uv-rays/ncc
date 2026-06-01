import { NextResponse } from "next/server";
import { requireAdmin } from "./auth";

export function withAdmin<TContext = unknown>(
  handler: (request: Request, context: TContext) => Promise<Response>
) {
  return async (request: Request, context: TContext): Promise<Response> => {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    try {
      return await handler(request, context);
    } catch (error) {
      console.error("[admin route error]", error);
      return NextResponse.json(
        { error: "Server error." },
        { status: 500 }
      );
    }
  };
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function safeJson(payload: unknown, status = 200) {
  return NextResponse.json(payload, { status });
}

export async function readJson<T = unknown>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
}
