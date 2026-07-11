import { Suspense } from "react";
import { AuthForm } from "./auth-form";

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
