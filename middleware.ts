import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isProtectedApiRoute = createRouteMatcher([
  "/api/sandbox(.*)",
  "/api/copilot(.*)",
  "/api/compliance(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  if (isProtectedDashboardRoute(request) && !userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (isProtectedApiRoute(request) && !userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
