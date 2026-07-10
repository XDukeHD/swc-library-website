import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";

  if (!hostname.startsWith("dl.")) {
    return NextResponse.next();
  }

  const mainHostname = hostname.replace(/^dl\./, "");
  const { pathname } = request.nextUrl;
  const slug = pathname.split("/").filter(Boolean)[0] || "";

  if (!slug) {
    return NextResponse.redirect(`${request.nextUrl.protocol}//${mainHostname}`);
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = `/dl/${slug}`;
  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|otf|css|js|json)).*)",
  ],
};
