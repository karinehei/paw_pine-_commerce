import { CommerceError } from "@/lib/commerce/errors";

/** Server logs only. Never include tokens, headers, GraphQL bodies, or PII. */
export function logStorefrontFailure(event: {
  operation: string;
  code: string;
  status?: number;
  detail?: string;
}): void {
  console.error(
    "[storefront]",
    event.operation,
    event.code,
    event.status !== undefined ? `http_${event.status}` : "",
    event.detail ?? "",
    JSON.stringify({
      event: "storefront_error",
      operation: event.operation,
      code: event.code,
      http_status: event.status ?? null,
    }),
  );
}

export function logOpsEvent(
  channel: "health" | "cwv",
  payload: Record<string, string | number | boolean | null>,
): void {
  console.info(`[${channel}]`, JSON.stringify(payload));
}

export function toStorefrontError(
  operation: string,
  status: number,
  detail?: string,
): CommerceError {
  if (status === 429) {
    logStorefrontFailure({ operation, code: "rate_limited", status, detail });
    return new CommerceError("rate_limited");
  }
  if (status === 401 || status === 403) {
    logStorefrontFailure({ operation, code: "unauthorized", status, detail });
    return new CommerceError("unavailable");
  }
  logStorefrontFailure({ operation, code: "unavailable", status, detail });
  return new CommerceError("unavailable");
}
