import { getMessages } from "@/lib/i18n/messages";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";

export class CommerceError extends Error {
  readonly code:
    | "unavailable"
    | "not_found"
    | "invalid_cart"
    | "out_of_stock"
    | "network"
    | "rate_limited";

  constructor(
    code: CommerceError["code"],
    message = "Something went wrong while loading the shop.",
  ) {
    super(message);
    this.name = "CommerceError";
    this.code = code;
  }
}

export type CommerceErrorCode = CommerceError["code"];

export function toUserErrorMessage(
  error: unknown,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const t = getMessages(locale);
  if (error instanceof CommerceError) {
    return messageForCommerceCode(error.code, locale);
  }

  return t.genericError;
}

export function messageForCommerceCode(
  code: CommerceErrorCode,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const t = getMessages(locale);
  switch (code) {
    case "unavailable":
      return t.errorUnavailable;
    case "not_found":
      return t.errorNotFound;
    case "invalid_cart":
      return t.errorInvalidCart;
    case "out_of_stock":
      return t.errorOutOfStock;
    case "network":
      return t.errorNetwork;
    case "rate_limited":
      return t.errorRateLimited;
    default:
      return t.genericError;
  }
}
