import Link from "next/link";
import { CheckCircle2, ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function PaymentSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center space-y-3">
          <CheckCircle2 className="size-14 text-green-600" />

          <CardTitle className="text-2xl">Payment Submitted</CardTitle>

          <CardDescription>
            You have returned from Stripe Checkout. Your payment is being
            verified.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Once the payment is confirmed, your service request will be updated
            automatically.
          </p>

          <Button
            nativeButton={false}
            render={<Link href="/customer/requests" />}
            className="w-full"
          >
            <ClipboardList className="size-4" />
            View My Requests
          </Button>

          <p className="text-xs text-muted-foreground">
            If your request still shows PENDING, wait briefly and refresh the
            page.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
