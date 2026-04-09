import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "lllarik_dashboard_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/login";
  const isDashboard = pathname.startsWith("/dashboard");
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (isLoginPage) {
    if (token) {
      const overviewUrl = request.nextUrl.clone();
      overviewUrl.pathname = "/dashboard/overview";
      return NextResponse.redirect(overviewUrl);
    }
    return NextResponse.next();
  }

  if (!isDashboard) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
