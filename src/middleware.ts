import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If authenticated user visits /login or /register → redirect to dashboard
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (token && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Protect dashboard routes only — allow everything else to pass through
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        const protectedPaths = ["/dashboard", "/diary", "/progress", "/settings", "/onboarding"];
        const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
        if (isProtected) return !!token;
        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/diary/:path*",
    "/progress/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/login",
    "/register",
  ],
};
