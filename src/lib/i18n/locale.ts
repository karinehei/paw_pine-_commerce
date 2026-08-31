import "server-only";

import { cookies, headers } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  isLocale,
  type Locale,
} from "@/lib/i18n/config";

export async function getLocale(): Promise<Locale> {
  try {
    const headerValue = (await headers()).get(LOCALE_HEADER);
    if (isLocale(headerValue)) {
      return headerValue;
    }
    const cookieValue = (await cookies()).get(LOCALE_COOKIE)?.value;
    if (isLocale(cookieValue)) {
      return cookieValue;
    }
  } catch (error) {
    unstable_rethrow(error);
    return DEFAULT_LOCALE;
  }
  return DEFAULT_LOCALE;
}
