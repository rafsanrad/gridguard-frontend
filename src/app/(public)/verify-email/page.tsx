import VerifyEmailForm from "@/components/auth/verify-email-form";
import { Suspense } from "react";


export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Suspense fallback={<p>Loading verification form...</p>}>
        <VerifyEmailForm />
      </Suspense>
    </main>
  );
}
