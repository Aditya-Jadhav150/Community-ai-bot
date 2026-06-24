import { withAuth } from "next-auth/middleware";
export default withAuth;

export const config = {
  matcher: ["/report/:path*", "/map/:path*", "/dashboard/:path*", "/issues/:path*", "/settings/:path*", "/admin/:path*"],
};
