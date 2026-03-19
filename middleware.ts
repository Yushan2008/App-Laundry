import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/admin",
  SELLER: "/seller",
  CUSTOMER: "/dashboard",
};

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const role = token?.role as string | undefined;
    const pathname = req.nextUrl.pathname;

    // Admin routes → hanya ADMIN
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL(ROLE_HOME[role ?? ""] ?? "/login", req.url));
    }

    // Seller routes → hanya SELLER
    if (pathname.startsWith("/seller") && role !== "SELLER") {
      return NextResponse.redirect(new URL(ROLE_HOME[role ?? ""] ?? "/login", req.url));
    }

    // Customer routes → hanya CUSTOMER
    if (
      (pathname.startsWith("/dashboard") ||
        pathname.startsWith("/order") ||
        pathname.startsWith("/history")) &&
      role !== "CUSTOMER"
    ) {
      return NextResponse.redirect(new URL(ROLE_HOME[role ?? ""] ?? "/login", req.url));
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
  matcher: [
    "/dashboard/:path*",
    "/order/:path*",
    "/history/:path*",
    "/admin/:path*",
    "/seller/:path*",
  ],
};
