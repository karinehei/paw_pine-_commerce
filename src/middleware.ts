import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, LOCALE_HEADER } from "@/lib/i18n/config";
import { resolveLocaleRouting } from "@/lib/i18n/path";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const routing = resolveLocaleRouting(
    pathname,
    request.cookies.get(LOCALE_COOKIE)?.value,
  );

  if (routing.kind === "not_found") {
    return NextResponse.rewrite(new URL("/invalid-locale", request.url), {
      status: 404,
    });
  }

  const requestHeaders = new Headers(request.headers);

  if (routing.kind === "redirect") {
    const response = NextResponse.redirect(
      new URL(`${routing.location}${search}`, request.url),
      308,
    );
    const redirected = resolveLocaleRouting(routing.location);
    if (redirected.kind === "rewrite") {
      response.cookies.set(LOCALE_COOKIE, redirected.locale, {
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return response;
  }

  requestHeaders.set(LOCALE_HEADER, routing.locale);
  const response = NextResponse.rewrite(
    new URL(`${routing.rewritePath}${search}`, request.url),
    { request: { headers: requestHeaders } },
  );
  response.cookies.set(LOCALE_COOKIE, routing.locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next|icon|opengraph-image|apple-icon|twitter-image|invalid-locale|.*\\..*).*)",
  ],
};
