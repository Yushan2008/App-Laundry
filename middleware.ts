import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Proteksi halaman admin: hanya ADMIN yang boleh akses
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Proteksi halaman customer: hanya CUSTOMER yang boleh akses
    if (
      (pathname.startsWith("/dashboard") ||
        pathname.startsWith("/order") ||
        pathname.startsWith("/history")) &&
      token?.role !== "CUSTOMER"
    ) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/order/:path*", "/history/:path*", "/admin/:path*"],
};
