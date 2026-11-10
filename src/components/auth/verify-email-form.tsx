"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "sonner";

import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const verifySchema = z.object({
  email: z.email("Please enter a valid email address"),
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export default function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailFromUrl = searchParams.get("email") ?? "";

  const [serverError, setServerError] = useState("");
  const [isSending, setIsSending] = useState(false);

  const form = useForm({
    defaultValues: {
      email: emailFromUrl,
      otp: "",
    },
    validators: {
      onBlur: verifySchema,
    },
    onSubmit: async ({ value }) => {
      setServerError("");

      try {
        await authService.verifyEmailOtp({
          email: value.email.trim(),
          otp: value.otp,
        });

        toast.success("Email verified successfully!");
        router.replace("/login");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Verification failed";

        setServerError(message);
        toast.error(message);
      }
    },
  });

  async function handleSendOtp() {
    const email = form.getFieldValue("email").trim();
    const result = z.email().safeParse(email);

    if (!result.success) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSending(true);
    setServerError("");

    try {
      await authService.verifyEmail({ email });
      toast.success("Verification OTP sent to your email!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send OTP";

      setServerError(message);
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Verify Your Email</CardTitle>
        <CardDescription>
          Request a verification code and enter the 6-digit OTP sent to your
          email address.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-5"
        >
          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email Address</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors
                        .map((error) =>
                          typeof error === "string" ? error : error?.message,
                        )
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
              </div>
            )}
          </form.Field>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isSending}
            onClick={handleSendOtp}
          >
            {isSending ? "Sending OTP..." : "Send / Resend OTP"}
          </Button>

          <form.Field name="otp">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Verification Code</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  autoComplete="one-time-code"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(
                      event.target.value.replace(/\D/g, "").slice(0, 6),
                    )
                  }
                />
                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors
                        .map((error) =>
                          typeof error === "string" ? error : error?.message,
                        )
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
              </div>
            )}
          </form.Field>

          {serverError && (
            <p role="alert" className="text-sm text-destructive">
              {serverError}
            </p>
          )}

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                className="w-full"
                disabled={!canSubmit || isSubmitting || isSending}
              >
                {isSubmitting ? "Verifying..." : "Verify Email"}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already verified?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
