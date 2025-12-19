import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in",
    "/sign-up",
    "/api/webhook/clerk",
  ],
});

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
