import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "lllarik_dashboard_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === "/dashboard/login";
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (!token && !isLoginPage) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/dashboard/login";
    return NextResponse.redirect(loginUrl);
  }

  if (token && isLoginPage) {
    const overviewUrl = request.nextUrl.clone();
    overviewUrl.pathname = "/dashboard/overview";
    return NextResponse.redirect(overviewUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
