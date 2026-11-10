import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Suspense fallback={<p>Loading reset password form...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
