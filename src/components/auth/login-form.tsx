"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { ShieldCheck, Wrench, UserRound, Loader2 } from "lucide-react";

import { authService, type UserRole } from "@/services/auth.service";

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

const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const dashboardRoutes: Record<UserRole, string> = {
  ADMIN: "/admin/dashboard",
  OPERATOR: "/operator/dashboard",
  CUSTOMER: "/customer/dashboard",
};

type LoginCredentials = {
  email: string;
  password: string;
};

type DemoAccount = {
  role: UserRole;
  label: string;
  email: string | undefined;
  password: string | undefined;
};

const demoAccounts: DemoAccount[] = [
  {
    role: "ADMIN",
    label: "Admin",
    email: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL,
    password: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD,
  },
  {
    role: "OPERATOR",
    label: "Operator",
    email: process.env.NEXT_PUBLIC_DEMO_OPERATOR_EMAIL,
    password: process.env.NEXT_PUBLIC_DEMO_OPERATOR_PASSWORD,
  },
  {
    role: "CUSTOMER",
    label: "Customer",
    email: process.env.NEXT_PUBLIC_DEMO_CUSTOMER_EMAIL,
    password: process.env.NEXT_PUBLIC_DEMO_CUSTOMER_PASSWORD,
  },
];

const demoIcons = {
  ADMIN: ShieldCheck,
  OPERATOR: Wrench,
  CUSTOMER: UserRound,
};

export default function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [serverError, setServerError] = useState("");
  const [activeDemoRole, setActiveDemoRole] = useState<UserRole | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authenticate = async (
    credentials: LoginCredentials,
    expectedRole?: UserRole,
  ) => {
    if (isAuthenticating) return;

    setIsAuthenticating(true);
    setServerError("");

    try {
      await authService.login(credentials);

      const response = await authService.getMe();
      const user = response.data;

      if (expectedRole && user.role !== expectedRole) {
        throw new Error(
          `This demo account does not have the ${expectedRole} role.`,
        );
      }

      queryClient.clear();
      queryClient.setQueryData(["auth", "me"], user);

      toast.success(`Welcome back, ${user.name}!`);

      router.replace(dashboardRoutes[user.role]);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";

      setServerError(message);
      toast.error(message);
    } finally {
      setIsAuthenticating(false);
      setActiveDemoRole(null);
    }
  };

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onBlur: loginSchema,
    },
    onSubmit: async ({ value }) => {
      await authenticate(value);
    },
  });

  const handleDemoLogin = async (account: DemoAccount) => {
    if (isAuthenticating) return;

    if (!account.email || !account.password) {
      toast.error(`${account.label} demo credentials are not configured.`);
      return;
    }

    setActiveDemoRole(account.role);

    await authenticate(
      {
        email: account.email,
        password: account.password,
      },
      account.role,
    );
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>Sign in to your GridGuard account</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
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
                <Label htmlFor={field.name}>Email</Label>

                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={field.state.value}
                  disabled={isAuthenticating}
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

          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={field.name}>Password</Label>

                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={field.state.value}
                  disabled={isAuthenticating}
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
                disabled={!canSubmit || isSubmitting || isAuthenticating}
              >
                {isSubmitting || (isAuthenticating && !activeDemoRole)
                  ? "Signing in..."
                  : "Sign In"}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>

          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1 text-center">
            <h3 className="text-sm font-semibold">Quick Demo Login</h3>
            <p className="text-xs text-muted-foreground">
              Explore GridGuard using a demo account
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {demoAccounts.map((account) => {
              const Icon = demoIcons[account.role];
              const isLoading = activeDemoRole === account.role;

              return (
                <Button
                  key={account.role}
                  type="button"
                  variant="outline"
                  className="h-auto min-h-24 flex-col gap-2 px-2 py-3"
                  disabled={isAuthenticating}
                  onClick={() => {
                    void handleDemoLogin(account);
                  }}
                >
                  {isLoading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <Icon className="size-5" />
                  )}

                  <span className="text-xs font-medium">
                    {isLoading ? "Signing in..." : account.label}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Create account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
