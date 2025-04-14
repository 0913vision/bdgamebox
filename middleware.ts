import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  const pathname = url.pathname; // e.g. /quest/feed

  if (pathname.startsWith("/quest/")) {
    const slug = pathname.split("/")[2]; // "feed", "play", ...
    const cookieName = `allow${slug.charAt(0).toUpperCase()}${slug.slice(1)}Access`;
    const cookie = req.cookies.get(cookieName);

    if (!cookie || cookie.value !== "true") {
      url.pathname = "/lab";
      return NextResponse.redirect(url);
    }

    // 쿠키 제거 (한 번용)
    const res = NextResponse.next();
    res.cookies.set(cookieName, "", { maxAge: 0 });
    return res;
  }

  return NextResponse.next();
}
