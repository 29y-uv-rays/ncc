export interface FetchOptions extends RequestInit {
  timeoutMs?: number;
}

export class FetchError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "FetchError";
    this.status = status;
  }
}

export async function fetchJson<T>(url: string, init?: FetchOptions): Promise<T> {
  const { timeoutMs = 10000, ...rest } = init ?? {};
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(rest.headers ?? {}),
      },
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw new FetchError("Request timed out.", 0);
    }
    throw new FetchError("Network error. Please try again.", 0);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let message = response.statusText || "Request failed";
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload?.error) message = payload.error;
    } catch {
      try {
        const text = await response.text();
        if (text) message = text;
      } catch {
        // ignore
      }
    }
    throw new FetchError(message, response.status);
  }

  return (await response.json()) as T;
}
