import { NextResponse, type NextRequest } from "next/server";

// Inlined intentionally: middleware runs on the edge and must not import the
// server-only auth module (which pulls in pg / next headers).
const SESSION_COOKIE = "panti_session";

/**
 * Coarse guard: only checks for the presence of the session cookie.
 * Real session validation happens in the (dashboard) layout and API routes.
 * /login performs its own valid-session redirect so stale cookies can't loop.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);

  if (!hasSession && pathname !== "/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = pathname !== "/" ? `?from=${encodeURIComponent(pathname)}` : "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|.*\\..*).*)"],
};
