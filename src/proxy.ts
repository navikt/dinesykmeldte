import { type NextRequest, NextResponse, type ProxyConfig } from "next/server";
import { AUTH_HEADERS } from "./auth/constants";

export function proxy(request: NextRequest): NextResponse {
  const { pathname, search, basePath } = request.nextUrl;
  const requestedPath = `${basePath}${pathname}${search}`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(AUTH_HEADERS.REQUESTED_PATH_HEADER, requestedPath);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config: ProxyConfig = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
