import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, safeNext } from "@/lib/auth/session";

export function proxy(request: NextRequest) {
  const signedIn = request.cookies.has(SESSION_COOKIE);
  const { pathname, search } = request.nextUrl;

  if (pathname === "/entrar" || pathname === "/criar-conta") {
    if (!signedIn) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/", request.url));
  }

  if (signedIn) {
    return NextResponse.next();
  }

  const next = new URL("/entrar", request.url);
  next.searchParams.set("next", safeNext(`${pathname}${search}`));
  return NextResponse.redirect(next);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
