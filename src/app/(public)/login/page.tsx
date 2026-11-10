import type { Metadata } from "next";
import LoginForm from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login | GridGuard",
  description: "Sign in to your GridGuard account.",
};

export default function LoginPage() {
  return (
    <section className="flex min-h-[75vh] items-center justify-center px-4 py-16">
      <LoginForm />
    </section>
  );
}
