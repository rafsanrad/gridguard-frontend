"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "sonner";
import { AlertTriangle, Loader2, Send } from "lucide-react";
import CustomerOutageHistory from "@/components/dashboard/customer-outage-history";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateOutageReport } from "@/hooks/use-customer-data";

const outageReportSchema = z
  .object({
    location: z.string().max(255, "Location cannot exceed 255 characters"),
    description: z
      .string()
      .max(500, "Description cannot exceed 500 characters"),
  })
  .refine((data) => Boolean(data.location.trim() || data.description.trim()), {
    message: "Provide a location or description",
    path: ["location"],
  });

export default function ReportOutagePage() {
  const createReport = useCreateOutageReport();

  const form = useForm({
    defaultValues: {
      location: "",
      description: "",
    },
    validators: {
      onChange: outageReportSchema,
    },
    onSubmit: async ({ value }) => {
      const result = outageReportSchema.safeParse(value);

      if (!result.success) {
        toast.error("Please check the form fields.");
        return;
      }

      try {
        const response = await createReport.mutateAsync({
          location: result.data.location.trim() || undefined,
          description: result.data.description.trim() || undefined,
        });

        toast.success(response.message || "Outage reported successfully.");
        form.reset();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to submit outage report.",
        );
      }
    },
  });

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <AlertTriangle className="size-8 text-primary" />
          <h1 className="text-3xl font-bold">Report Outage</h1>
        </div>

        <p className="text-muted-foreground">
          Report a power outage in your area so the team can investigate.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Submit Outage Report</CardTitle>
          <CardDescription>
            Provide the location and details of the power interruption.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void form.handleSubmit();
            }}
            className="space-y-6"
          >
            <form.Field name="location">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Location</Label>

                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="e.g. Dhanmondi, Dhaka"
                    maxLength={255}
                    aria-invalid={
                      field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0
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

            <form.Field name="description">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Description</Label>

                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="Describe the power outage..."
                    rows={5}
                    maxLength={500}
                    aria-invalid={
                      field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0
                    }
                  />

                  <p className="text-xs text-muted-foreground">
                    {field.state.value.length}/500 characters
                  </p>

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

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={
                    !canSubmit || isSubmitting || createReport.isPending
                  }
                >
                  {isSubmitting || createReport.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}

                  {isSubmitting || createReport.isPending
                    ? "Submitting..."
                    : "Submit Report"}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </CardContent>
      </Card>
      <CustomerOutageHistory />
    </section>
  );
}
