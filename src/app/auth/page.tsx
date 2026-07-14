import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "./auth-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-[#64748B]">
          Loading...
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
