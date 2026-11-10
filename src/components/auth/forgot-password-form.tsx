"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "sonner";
import { Mail } from "lucide-react";

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

const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onBlur: forgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError("");

      try {
        await authService.forgotPassword({
          email: value.email.trim(),
        });

        toast.success("Password reset OTP sent to your email!");

        router.push(
          `/reset-password?email=${encodeURIComponent(value.email.trim())}`,
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to send password reset OTP";

        setServerError(message);
        toast.error(message);
      }
    },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="size-6 text-primary" />
        </div>

        <CardTitle className="text-2xl">Forgot Password?</CardTitle>

        <CardDescription>
          Enter your email address and we will send you a 6-digit OTP to reset
          your password.
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
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? "Sending OTP..." : "Send Reset OTP"}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Back to Login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
