import Link from "next/link";
import { ArrowLeft, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function PaymentCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center space-y-3">
          <XCircle className="size-14 text-amber-600" />

          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>

          <CardDescription>
            You left the Stripe Checkout page before completing your payment.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your service request has not been approved. You can return to your
            requests to check its status.
          </p>

          <Button
            nativeButton={false}
            render={<Link href="/customer/requests" />}
            className="w-full"
          >
            <ArrowLeft className="size-4" />
            Back to My Requests
          </Button>

          <p className="text-xs text-muted-foreground">
            A cancelled checkout may leave a pending payment record. A new
            checkout may be blocked until that record is resolved.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
