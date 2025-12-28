import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/roadmaps", "/profile", "/settings"];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ["/login", "/register"];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionToken = request.cookies.get("loom_session")?.value;

    // Check if the current route is protected
    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
        pathname.startsWith(route)
    );

    // Check if the current route is an auth route
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

    // Redirect to login if accessing protected route without session
    if (isProtectedRoute && !sessionToken) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect to dashboard if accessing auth routes while logged in
    if (isAuthRoute && sessionToken) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match all routes except static files and API
        "/((?!_next/static|_next/image|favicon.ico|api|.*\\.).*)",
    ],
};
