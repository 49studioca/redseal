import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "crypto";
import {
  getSupabaseConfig,
  usesSupabaseData,
} from "@/lib/supabase/config";
import { DEVICE_COOKIE } from "@/lib/auth/devices";

function withSupabaseCookies(
  target: NextResponse,
  source: NextResponse,
): NextResponse {
  source.cookies.getAll().forEach(({ name, value }) => {
    target.cookies.set(name, value);
  });
  for (const header of ["cache-control", "expires", "pragma"] as const) {
    const value = source.headers.get(header);
    if (value) target.headers.set(header, value);
  }
  return target;
}

function ensureDeviceCookie(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  if (request.cookies.get(DEVICE_COOKIE)?.value) {
    return response;
  }

  response.cookies.set(DEVICE_COOKIE, randomUUID(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 2,
  });
  return response;
}

export async function updateSession(request: NextRequest) {
  if (!usesSupabaseData()) {
    return ensureDeviceCookie(request, NextResponse.next({ request }));
  }

  let supabaseResponse = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseConfig();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) =>
          supabaseResponse.headers.set(key, value),
        );
      },
    },
  });

  // Do not run code between createServerClient and getUser — session refresh
  // must happen here or users get randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = Boolean(user);

  const protectedPaths = [
    "/dashboard",
    "/onboarding",
    "/admin",
    "/instructor",
  ];
  const isProtected = protectedPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p),
  );

  if (isProtected && !isAuthenticated) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth";
    redirectUrl.searchParams.set("signin", "");
    redirectUrl.searchParams.set(
      "redirect",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return withSupabaseCookies(
      ensureDeviceCookie(
        request,
        NextResponse.redirect(redirectUrl),
      ),
      supabaseResponse,
    );
  }

  if (
    isAuthenticated &&
    (request.nextUrl.pathname === "/auth" ||
      request.nextUrl.pathname.startsWith("/auth/login") ||
      request.nextUrl.pathname.startsWith("/auth/signup"))
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return withSupabaseCookies(
      ensureDeviceCookie(
        request,
        NextResponse.redirect(redirectUrl),
      ),
      supabaseResponse,
    );
  }

  return ensureDeviceCookie(request, supabaseResponse);
}
