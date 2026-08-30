import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  type Locale,
} from "@/lib/i18n/config";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale: Locale =
    pathname === "/fi" || pathname.startsWith("/fi/") ? "fi" : DEFAULT_LOCALE;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, locale);

  const rewritePath = locale === "fi" ? pathname.slice(3) || "/" : null;

  const response = rewritePath
    ? NextResponse.rewrite(
        new URL(`${rewritePath}${request.nextUrl.search}`, request.url),
        {
          request: { headers: requestHeaders },
        },
      )
    : NextResponse.next({ request: { headers: requestHeaders } });

  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
